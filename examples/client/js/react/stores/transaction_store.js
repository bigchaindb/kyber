import { safeMerge } from 'js-utility-belt/es6';
import alt from '../alt';

import parseEscrowData from '../../utils/cryptoconditions/parse_escrow_data';
import {
    getStatus,
    getTransaction,
    listTransactions,
    listOutputs,
    postTransaction,
} from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../constants/application_constants';

import TransactionActions from '../actions/transaction_actions';
import TransactionSource from '../sources/transaction_source';

class TransactionStore {
    constructor() {
        this.transaction = null;
        this.transactionList = {};
        this.outputList = [];
        this.transactionMeta = {
            asset_id: null,
            err: null,
            public_key: null,
            transaction: null,
            tx_id: null,
            unspent: null,
            search: null
        };
        this.bindActions(TransactionActions);
        this.registerAsync(TransactionSource);
    }

    onFetchTransactionList({ asset_id, operation, search, blockWhenFetching }) {
        if (!blockWhenFetching ||
            (blockWhenFetching && !this.transactionMeta.isFetchingList)) {
            this.transactionMeta.asset_id = asset_id;
            this.transactionMeta.operation = operation;
            this.transactionMeta.search = search;
            this.transactionMeta.isFetchingList = true;
            this.getInstance().lookupTransactionList();
        }
    }

    onSuccessFetchTransactionList(transactionList) {
        if (transactionList) {
            console.log('onSuccessFetchTransactionList', transactionList)
            // this.transactionList[asset_id] = ...
            this.transactionMeta.err = null;
            this.transactionMeta.asset_id = null;
            this.transactionMeta.operation = null;
        } else {
            this.transactionMeta.err = new Error('Problem fetching the transaction list');
        }
        this.transactionMeta.isFetchingList = false;
    }

    postProcessTransaction(transaction) {
        const condition = transaction.transaction.conditions[0].condition;

        if (Array.isArray(condition.details.subfulfillments)) {
            transaction.type = 'multi-owner';
            return safeMerge(
                transaction,
                parseEscrowData(condition.details)
            );
        } else {
            transaction.type = 'single-owner';
        }

        return transaction;
    }

    onFlushTransactionList() {
        this.transactionList = [];
        this.transactionMeta.asset_id = null;
        this.transactionMeta.operation = null;
        this.transactionMeta.search = null;
        this.transactionMeta.isFetchingList = false;
    }

    onPostTransaction(transaction) {
        this.transactionMeta.transaction = transaction;
        this.getInstance().postTransaction();
    }

    onSuccessPostTransaction(transaction) {
        if (transaction) {
            this.transaction = transaction;
            this.transactionMeta.err = null;
            this.transactionMeta.transaction = null;
        } else {
            this.transactionMeta.err = new Error('Problem posting the transaction');
        }
    }

    onFetchTransaction(tx_id) {
        this.transactionMeta.tx_id = tx_id;
        this.getInstance().lookupTransaction();
    }

    onSuccessFetchTransaction(transaction) {
        if (transaction) {
            this.transaction = transaction;
            this.transactionMeta.err = null;
            this.transactionMeta.transaction = null;
        } else {
            this.transactionMeta.err = new Error('Problem fetching the transaction');
        }
    }

    onFlushTransaction() {
        this.transaction = null;
        this.transactionMeta.err = null;
        this.transactionMeta.transaction = null;
        this.transactionMeta.asset_id = null;
        this.transactionMeta.operation = null;
        this.transactionMeta.search = null;
        this.transactionMeta.isFetchingList = false;
    }

    onErrorTransaction(err) {
        this.transactionMeta.err = err;
        this.transactionMeta.isFetchingList = false;
    }

    onFetchOutputList({public_key, unspent}) {
        this.transactionMeta.public_key = public_key;
        this.transactionMeta.unspent = unspent;
        this.getInstance().lookupOutputList();
    }

    onSuccessFetchOutputList(outputList) {
        if (outputList) {
            this.outputList = outputList;
            this.outputList.map((output) => {
                this.postProcessOutput(output);
            });
            this.transactionMeta.err = null;
            this.transactionMeta.public_key = null;
            this.transactionMeta.unspent = null;
        } else {
            this.transactionMeta.err = new Error('Problem fetching the transaction list');
        }
        this.transactionMeta.isFetchingList = false;
    }

    postProcessOutput(output) {
        getTransaction(output.split("/")[2], API_PATH)
            .then((tx) => {
                const asset_id = this.getAssetIdFromTransaction(tx);
                if (asset_id) {
                    listTransactions({ asset_id }, API_PATH)
                        .then((transactions) => {
                            this.transactionList[asset_id] = transactions;
                        })
                }
            })
    }

    getAssetIdFromTransaction(transaction){
        let asset_id;
        if (transaction && transaction.asset) {
            if (transaction.asset.id) {
                asset_id = transaction.asset.id;
            } else {
                asset_id = transaction.id;
            }
        }
        return asset_id;
    }

}

export default alt.createStore(TransactionStore, 'TransactionStore');
