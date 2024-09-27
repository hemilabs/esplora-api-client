# esplora-client

Tiny client library for Esplora-based Bitcoin APIs, like the ones provided by mempool.space and blockstream.info.

The package exposes an API compatible with [mempool.js](https://github.com/mempool/mempool.js), the official mempool.space NPM package, but supports just a few options and implements only some basic Bitcoin methods.

It also has the ability to retry failed calls across APIs: if a call to mempool.space fails, it is retried by calling blockstream.info.

## Installation

```sh
npm install esplora-client
```

## Usage

```js
import { esploraApiClient } from "esplora-client";

const { bitcoin } = esploraApiClient({ network: "testnet" });
const address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
const { chain_stats } = await bitcoin.addresses.getAddress({ address });
const balance = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
```

## Options

- `hostnames`: List of API hostnames. Defaults to `["mempool.space", "blockstream.info"]`.
- `network`: Network name. Defaults to `mainnet`.

## Bitcoin methods

- Addresses:
  - getAddress({ address })
  - getAddressTxs({ address })
  - getAddressTxsUtxo({ address })
- Blocks:
  - getBlocksTipHeight()
- Fees:
  - getFeeEstimates() - Supported by mempool.space but undocumented
  - getFeesRecommended() - Only supported by mempool.space
- Transactions:
  - getTx({ txid })
  - getTxHex({ txid })
  - postTx({ txhex })

## See also

NPM packages:

- https://github.com/mempool/mempool.js
- https://github.com/MiguelMedeiros/esplora-js

API docs:

- https://mempool.space/docs/api/rest
- https://github.com/Blockstream/esplora/blob/master/API.md
