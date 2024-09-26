import fetch from "fetch-plus-plus";

const hostnames = ["mempool.space", "blockstream.info"];

export const esploraApiClient = function ({ network }) {
  const basePath = !network || network === "mainnet" ? "api" : `${network}/api`;

  const concatenateErrorMessage = (previousError, hostname) => (fetchError) =>
    Promise.reject(
      new Error(`${previousError.message}, ${hostname}: ${fetchError.message}`),
    );

  const chainFetchCallsOnFailure =
    (path, options) => (promiseChain, hostname) =>
      promiseChain.catch((err) =>
        fetch(`https://${hostname}/${basePath}/${path}`, options).catch(
          concatenateErrorMessage(err, hostname),
        ),
      );

  const fetchApi = (path, options) =>
    hostnames.reduce(
      chainFetchCallsOnFailure(path, options),
      Promise.reject(new Error("Out of retry options")),
    );

  return {
    bitcoin: {
      addresses: {
        getAddress: ({ address }) => fetchApi(`address/${address}`),
        getAddressTxs: ({ address }) => fetchApi(`address/${address}/txs`),
        getAddressTxsUtxo: ({ address }) => fetchApi(`address/${address}/utxo`),
      },
      blocks: {
        getBlocksTipHeight: () => fetchApi("blocks/tip/height"),
      },
      fees: {
        getFeeEstimates: () => fetchApi("fee-estimates"),
        getFeesRecommended: () => fetchApi("v1/fees/recommended"),
      },
      transactions: {
        getTx: ({ txid }) => fetchApi(`tx/${txid}`),
        getTxHex: ({ txid }) => fetchApi(`tx/${txid}/hex`),
        postTx: ({ txhex }) => fetchApi("tx", { body: txhex, method: "POST" }),
      },
    },
  };
};
