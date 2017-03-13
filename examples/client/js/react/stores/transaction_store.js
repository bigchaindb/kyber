import { safeMerge } from 'js-utility-belt/es6';
import alt from '../alt';

import {
    getStatus,
    getTransaction,
    listTransactions,
    listOutputs,
    postTransaction,
} from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../constants/application_constants';
import parseEscrowData from '../../utils/cryptoconditions/parse_escrow_data';

import {
    getAssetIdFromTransaction
} from '../../utils/bigchaindb/transactions';

import TransactionActions from '../actions/transaction_actions';
import TransactionSource from '../sources/transaction_source';

class TransactionStore {
    constructor() {
        this.transaction = null;
        this.transactionList = {};
        this.assets = {};
        this.wallets = {};
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

    onFetchTransactionList({ assetId, operation, search, blockWhenFetching }) {
        if (!blockWhenFetching ||
            (blockWhenFetching && !this.transactionMeta.isFetchingList)) {
            this.transactionMeta.asset_id = assetId;
            this.transactionMeta.operation = operation;
            this.transactionMeta.search = search;
            this.transactionMeta.isFetchingList = true;
            this.getInstance().lookupTransactionList();
        }
    }

    onSuccessFetchTransactionList(transactionList) {
        if (transactionList) {
            if (this.transactionMeta.asset_id) {
                this.assets[this.transactionMeta.asset_id] = transactionList
            }
            this.transactionList = transactionList;
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
        if (!this.transactionMeta.isFetchingList) {
            this.transactionMeta.isFetchingList = true;
            this.transactionMeta.public_key = public_key;
            this.transactionMeta.unspent = unspent;
            this.getInstance().lookupOutputList();
        }
    }

    onSuccessFetchOutputList(outputList) {
        if (outputList) {
            const {public_key} = this.transactionMeta;
            let wallets = {};
            wallets[public_key] = {};
            wallets[public_key].unspents = [];
            wallets[public_key].assets = [];

            let counter = 0;
            outputList.map((output) => {
                // fetch the transaction for each output
                const txId = output.split("/")[2];
                getTransaction(txId, API_PATH).then((transaction) => {
                    wallets[public_key].unspents.push(transaction);
                    wallets[public_key].assets.push(getAssetIdFromTransaction(transaction));
                    // async changes, need to update state
                    counter++;
                    if (counter == outputList.length){
                        this.wallets = wallets;
                        this.emitChange();
                    }
                })
            });
            this.transactionMeta.err = null;
            this.transactionMeta.public_key = null;
            this.transactionMeta.unspent = null;
        } else {
            this.transactionMeta.err = new Error('Problem fetching the transaction list');
        }
        this.transactionMeta.isFetchingList = false;
    }

}

export default alt.createStore(TransactionStore, 'TransactionStore');
