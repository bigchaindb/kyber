import alt from '../alt';


class TransactionActions {
    constructor() {
        this.generateActions(
            'fetchTransactionList',
            'successFetchTransactionList',
            'flushTransactionList',
            'postTransaction',
            'successPostTransaction',
            'flushTransaction',
            'fetchTransaction',
            'successFetchTransaction',
            'fetchOutputList',
            'successFetchOutputList'
        );
    }
}

export default alt.createActions(TransactionActions);
