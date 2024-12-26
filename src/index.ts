import fetch from "fetch-plus-plus";

type Hostname = string;
type Hostnames = Hostname[];

type Options = {
  hostnames?: Hostnames;
  network?: string;
};

type FetchOptions = Parameters<typeof fetch>["1"];

type FetchError = {
  message: string;
};

/**
 * Creates a new Esplora API client.
 *
 * @param options Client options.
 * @param options.hostnames List of API hostnames.
 * @param options.network Network name.
 */
export const esploraClient = function (options: Options = {}) {
  const {
    hostnames = ["mempool.space", "blockstream.info"],
    network = "mainnet",
  } = options;

  const basePath = network === "mainnet" ? "api" : `${network}/api`;

  const concatenateErrorMessage =
    (previousError: FetchError, hostname: Hostname) =>
    (fetchError: FetchError) =>
      Promise.reject(
        new Error(
          `${previousError.message}, ${hostname}: ${fetchError.message}`,
        ),
      );

  const chainFetchCallsOnFailure =
    (path: string, opts?: FetchOptions) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (promiseChain: Promise<any>, hostname: Hostname) =>
      promiseChain.catch((err) =>
        fetch(`https://${hostname}/${basePath}/${path}`, opts).catch(
          concatenateErrorMessage(err, hostname),
        ),
      );

  const fetchApi = (path: string, opts?: FetchOptions) =>
    hostnames.reduce(
      chainFetchCallsOnFailure(path, opts),
      Promise.reject(new Error("All API calls failed")),
    );

  return {
    bitcoin: {
      addresses: {
        getAddress: ({ address }: { address: string }) =>
          fetchApi(`address/${address}`),
        getAddressTxs: ({
          address,
          after_txid,
        }: {
          address: string;
          after_txid?: string;
        }) =>
          fetchApi(
            `address/${address}/txs`,
            after_txid ? { queryString: { after_txid } } : undefined,
          ),
        getAddressTxsUtxo: ({ address }: { address: string }) =>
          fetchApi(`address/${address}/utxo`),
      },
      blocks: {
        getBlocksTipHeight: () => fetchApi("blocks/tip/height"),
      },
      fees: {
        getFeeEstimates: () => fetchApi("fee-estimates"),
        getFeesRecommended: () => fetchApi("v1/fees/recommended"),
      },
      transactions: {
        getTx: ({ txid }: { txid: string }) => fetchApi(`tx/${txid}`),
        getTxHex: ({ txid }: { txid: string }) => fetchApi(`tx/${txid}/hex`),
        postTx: ({ txhex }: { txhex: string }) =>
          fetchApi("tx", { body: txhex, method: "POST" }),
      },
    },
  };
};
