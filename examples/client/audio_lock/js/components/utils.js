import * as driver from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../../js/constants/application_constants';
import TransactionActions from '../../../js/react/actions/transaction_actions';


export function fetchAsset(id, publicKey) {
    setTimeout(() => {
        driver.Connection.pollStatusAndFetchTransaction(id, API_PATH)
            .then(() => {
                TransactionActions.fetchOutputList({
                    public_key: publicKey,
                    unspent: true
                });
                TransactionActions.fetchTransactionList({
                    assetId: id
                });
            })
    }, 1000);
}