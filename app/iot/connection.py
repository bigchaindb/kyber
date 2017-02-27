from time import sleep

from bigchaindb_driver import BigchainDB
from bigchaindb.common.utils import gen_timestamp
from utils.bigchaindb_utils import (
    poll_status_and_fetch_transaction,
    prepare_transfer_ed25519_simple,
    sign_ed25519
)


class ShargeBDBConnection(object):
    def __init__(self,
                 bdb_server_url,
                 sharge=None,
                 mobile=None):
        self.bdb = BigchainDB(bdb_server_url)
        self.sharge = sharge
        self.mobile = mobile
        self.data_stream = []
        self.create_stream()

    def create_stream(self):
        tx_create = self.bdb.transactions.prepare(
            operation='CREATE',
            signers=self.sharge.public_key,
            asset={
                'data':
                    {
                        'mobile': self.mobile.public_key,
                        'timestamp': gen_timestamp()
                    }
            },
        )
        tx_create_signed = self.bdb.transactions.fulfill(tx_create, private_keys=self.sharge.private_key)
        self.bdb.transactions.send(tx_create_signed)
        poll_status_and_fetch_transaction(tx_create_signed['id'], driver=self.bdb)
        self.data_stream.append(tx_create_signed['id'])

    def stream(self, data, throttle=0):
        for sample in data:
            tx_last_id = self.data_stream[-1]
            tx_last = self.bdb.transactions.retrieve(tx_last_id)

            tx_sample = prepare_transfer_ed25519_simple(
                transaction=tx_last,
                receiver=self.sharge.public_key,
                metadata=sample
            )
            tx_sample_signed = sign_ed25519(tx_sample, self.sharge.private_key)
            self.bdb.transactions.send(tx_sample_signed)
            poll_status_and_fetch_transaction(tx_sample_signed['id'], driver=self.bdb)
            self.data_stream.append(tx_sample_signed['id'])
            sleep(throttle)


if __name__ == '__main__':
    import os
    from mock_data_sharge import generate_mock_data
    BDB_SERVER_URL = os.getenv('BDB_SERVER_URL', 'http://localhost:9984')
    mock_data, sharge, mobile = generate_mock_data()
    conn = ShargeBDBConnection(BDB_SERVER_URL, sharge, mobile)
    conn.stream(mock_data)
