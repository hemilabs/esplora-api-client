import nock from "nock";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { esploraClient } from "../src";

describe("API fallback", function () {
  beforeAll(function () {
    nock.disableNetConnect();
  });

  it("should make a call and succeed", async function () {
    const hostnames = ["test.api.server"];
    const txid = "f057...6c56";
    const response = "0200...0000";
    nock(`https://${hostnames[0]}`)
      .get(`/api/tx/${txid}/hex`)
      .reply(200, response);

    const client = esploraClient({ hostnames });
    const data = await client.bitcoin.transactions.getTxHex({ txid });

    expect(data).toEqual(response);
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

    const client = esploraClient({ hostnames });
    const data = await client.bitcoin.blocks.getBlocksTipHeight();

    expect(data).toEqual(response);
  });

  it("should fail if all calls fail", async function () {
    const hostnames = ["failing.api.server", "private.api.server"];
    nock(`https://${hostnames[0]}`)
      .get(`/testnet/api/fee-estimates`)
      .reply(503, "Service Unavailable");
    nock(`https://${hostnames[1]}`)
      .get(`/testnet/api/fee-estimates`)
      .reply(404, "Not Found");

    const client = esploraClient({ hostnames, network: "testnet" });
    await expect(client.bitcoin.fees.getFeeEstimates()).rejects.toThrow(
      /Service Unavailable.*Not Found/,
    );
  });

  afterAll(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
