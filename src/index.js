/// <reference path="../types/index.js" />

import fetch from "fetch-plus-plus";

/**
 * Creates a new Esplora API client.
 *
 * @param {object} options Client options.
 * @param {string[]} [options.hostnames] List of API hostnames.
 * @param {string} [options.network] Network name.
 * @returns {EsploraClient}
 */
export const esploraApiClient = function (options = {}) {
  const {
    hostnames = ["mempool.space", "blockstream.info"],
    network = "mainnet",
  } = options;

  const basePath = network === "mainnet" ? "api" : `${network}/api`;

  const concatenateErrorMessage = (previousError, hostname) => (fetchError) =>
    Promise.reject(
      new Error(`${previousError.message}, ${hostname}: ${fetchError.message}`),
    );

  const chainFetchCallsOnFailure = (path, opts) => (promiseChain, hostname) =>
    promiseChain.catch((err) =>
      fetch(`https://${hostname}/${basePath}/${path}`, opts).catch(
        concatenateErrorMessage(err, hostname),
      ),
    );

  const fetchApi = (path, opts) =>
    hostnames.reduce(
      chainFetchCallsOnFailure(path, opts),
      Promise.reject(new Error("All API calls failed")),
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
