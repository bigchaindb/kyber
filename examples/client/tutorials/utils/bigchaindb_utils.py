from time import sleep
import bigchaindb_driver.exceptions


def get_connection_default():
    from bigchaindb_driver import BigchainDB
    from client.tutorials.constants.application_constants import BDB_SERVER_URL
    return BigchainDB(BDB_SERVER_URL)


def poll_status_and_fetch_transaction(txid, connection=None):
    if not connection:
        return get_connection_default()
    trials = 0
    tx_retrieved = None
    while trials < 100:
        try:
            res = connection.transactions.status(txid)
            print("Fetched transaction status: {}".format(res))
            if res.get('status') == 'valid':
                tx_retrieved = connection.transactions.retrieve(txid)
                print("Fetched transaction", tx_retrieved)
                break
        except bigchaindb_driver.exceptions.NotFoundError:
            trials += 1
        sleep(0.5)
    return tx_retrieved
