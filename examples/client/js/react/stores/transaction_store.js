import alt from '../alt';

import * as driver from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../constants/application_constants';

import TransactionActions from '../actions/transaction_actions';
import TransactionSource from '../sources/transaction_source';

class TransactionStore {
    constructor() {
        this.transaction = null;
        this.transactionList = [];
        this.transactionMap = {};
        this.unspentOutputs = {};
        this.transactionStatuses = {};
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
            this.transactionList = transactionList;
            this.transactionMeta.err = null;
            this.transactionMeta.asset_id = null;
            this.transactionMeta.operation = null;
        } else {
            this.transactionMeta.err = new Error('Problem fetching the transaction list');
        }
        this.transactionMeta.isFetchingList = false;
    }

    onFlushTransactionList() {
        this.transactionList = null;
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
            this.transaction = null;
            this.transactionMeta.err = null;
            this.transactionMeta.transaction = null;
            this.transactionMeta.public_key = null;
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
        this.transactionMeta.isFetchingList = true;
        this.transactionMeta.public_key = public_key;
        this.transactionMeta.unspent = unspent;
        this.getInstance().lookupOutputList();
    }

    onSuccessFetchOutputList(response) {
        // store state is unreliable in async concurrent, hence extract from url
        const public_key = response.url.match(/public_key=([^&]*)/)[1];
        response.json.then(jsonData => {
            const outputList = jsonData;
            if (outputList) {
                if (outputList.length == 0) {
                    this.unspentOutputs[public_key] = [];
                    this.transactionMeta.isFetchingList = false;
                } else {
                    const unspentOutputs =
                        outputList.map((output) => output.split("/")[2]);

                    const transactionsToFetch = unspentOutputs.filter(
                        (transactionId) => Object.keys(this.transactionMap).indexOf(transactionId) == -1
                    );

                    this.unspentOutputs[public_key] = unspentOutputs;

                    let counter = 0;
                    transactionsToFetch.forEach((transactionId) => {
                        driver.Connection
                            .getTransaction(transactionId, API_PATH)
                            .then((transaction) => {
                                this.transactionMap[transaction.id] = transaction;

                                driver.Connection
                                    .getStatus(transaction.id, API_PATH)
                                    .then((status) => {
                                        this.transactionStatuses[transaction.id] = status;
                                        counter++;
                                        if (counter == transactionsToFetch.length) {
                                            this.transactionMeta.isFetchingList = false;
                                            this.emitChange();
                                        }
                                    });
                            });
                    });
                    if (transactionsToFetch.length == 0) {
                        this.transactionMeta.isFetchingList = false;
                    }
                }

                this.transactionMeta.err = null;
                this.transactionMeta.public_key = null;
                this.transactionMeta.unspent = null;

            } else {
                this.transactionMeta.err = new Error('Problem fetching the transaction list');
            }
            this.emitChange();
        });
    }

}

export default alt.createStore(TransactionStore, 'TransactionStore');
