/**
 * @typedef {object} StatsInfo
 * @property {number} funded_txo_count
 * @property {number} funded_txo_sum
 * @property {number} spent_txo_count
 * @property {number} spent_txo_sum
 * @property {number} tx_count
 */

/**
 * @typedef {object} Address
 * @property {string} address
 * @property {StatsInfo} chain_stats
 * @property {StatsInfo} mempool_stats
 */

/**
 * @typedef Vin
 * @property {boolean} is_coinbase
 * @property {Vout} prevout
 * @property {string} scriptsig_asm
 * @property {string} scriptsig
 * @property {string} sequence
 * @property {string} txid
 * @property {number} vout
 */

/**
 * @typedef Vout
 * @property {string} scriptpubkey_address
 * @property {string} scriptpubkey_asm
 * @property {string} scriptpubkey_type
 * @property {string} scriptpubkey
 * @property {number} value
 */

/**
 * @typedef {object} Tx
 * @property {number} fee
 * @property {number} locktime
 * @property {number} size
 * @property {TxStatus} status
 * @property {string} txid
 * @property {number} version
 * @property {Vin[]} vin
 * @property {Vout[]} vout
 * @property {number} weight
 */

/**
 * @typedef {object} TxStatus
 * @property {string} block_hash
 * @property {number} block_height
 * @property {number} block_time
 * @property {boolean} confirmed
 */

/**
 * @typedef {object} AddressTxsUtxo
 * @property {TxStatus} status
 * @property {string} txid
 * @property {number} value
 * @property {number} vout
 */

/**
 * @typedef {object} AddressesMethods
 * @property {(params:{address:string})=>Promise<Address>} getAddress
 * @property {(params:{address:string,after_txid?:string})=>Promise<Tx[]>} getAddressTxs
 * @property {(params:{address:string})=>Promise<AddressTxsUtxo[]>} getAddressTxsUtxo
 */

/**
 * @typedef {object} BlocksMethods
 * @property {()=>Promise} getBlocksTipHeight
 */

/**
 * @typedef {object} FeesMethods
 * @property {()=>Promise} getFeeEstimates
 * @property {()=>Promise} getFeesRecommended
 */

/**
 * @typedef {object} TransactionsMethods
 * @property {(params:{txid:string})=>Promise<object>} getTx
 * @property {(params:{txid:string})=>Promise<string>} getTxHex
 * @property {(params:{txhex:string})=>Promise<string>} postTx
 */

/**
 * @typedef {object} EsploraClient
 * @property {object} bitcoin
 * @property {AddressesMethods} bitcoin.addresses
 * @property {BlocksMethods} bitcoin.blocks
 * @property {FeesMethods} bitcoin.fees
 * @property {TransactionsMethods} bitcoin.transactions
 */
