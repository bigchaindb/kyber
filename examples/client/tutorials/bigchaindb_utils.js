import request from '../lib/js/utils/request';
import ApiUrls from './api_urls';


export function requestStatus(transaction) {
    return request(ApiUrls['statuses'], {
            query: {
                tx_id: transaction.id
            }
        });
}

export function requestTransaction(txId) {
    return request(ApiUrls['transactions_detail'], {
            urlTemplateSpec: {
                txId
            }
        });
}

export function postTransaction(transaction) {
    return request(ApiUrls['transactions'], {
        method: 'POST',
        jsonBody: transaction
    })
}

export function pollStatusAndFetchTransaction(transaction, callback) {
    const timer = setInterval(() => {
        requestStatus(transaction)
            .then((res) => {
                console.log('Fetched transaction status:', res);
                if (res.status === 'valid') {
                    clearInterval(timer);
                    requestTransaction(transaction.id)
                        .then((res) => {
                            console.log('Fetched transaction:', res)
                            if (callback) {
                                callback();
                            }
                        });
                }
            });
    }, 500)
}
