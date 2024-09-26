import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";

import { esploraApiClient } from "../src/index.js";

chai.use(chaiAsPromised).should();

describe("API fallback", function () {
  before(function () {
    nock.disableNetConnect();
  });

  it("should make a call and succeed", async function () {
    const hostnames = ["test.api.server"];
    const txid = "f057...6c56";
    const response = "0200...0000";
    nock(`https://${hostnames[0]}`)
      .get(`/api/tx/${txid}/hex`)
      .reply(200, response);
    const client = esploraApiClient({ hostnames });
    const data = await client.bitcoin.transactions.getTxHex({ txid });
    data.should.deep.equal(response);
  });

  it("should make a second call if the first fails", async function () {
    const hostnames = ["failing.api.server", "working.api.server"];
    const response = 862000;
    nock(`https://${hostnames[0]}`)
      .get(`/api/blocks/tip/height`)
      .reply(503, "Service Unavailable");
    nock(`https://${hostnames[1]}`)
      .get(`/api/blocks/tip/height`)
      .reply(200, response.toString());
    const client = esploraApiClient({ hostnames });
    const data = await client.bitcoin.blocks.getBlocksTipHeight();
    data.should.equal(response);
  });

  it("should fail if all calls fail", async function () {
    const hostnames = ["failing.api.server", "private.api.server"];
    nock(`https://${hostnames[0]}`)
      .get(`/testnet/api/fee-estimates`)
      .reply(503, "Service Unavailable");
    nock(`https://${hostnames[1]}`)
      .get(`/testnet/api/fee-estimates`)
      .reply(404, "Not Found");
    const client = esploraApiClient({ hostnames, network: "testnet" });
    await client.bitcoin.fees
      .getFeeEstimates()
      .should.be.rejectedWith(/Service Unavailable.*Not Found/);
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
