from bigchaindb_driver import (
    BigchainDB,
)
from bigchaindb_driver.crypto import generate_keypair

from client.tutorials.constants.application_constants import BDB_SERVER_URL
from client.tutorials.utils.bigchaindb_utils import poll_status_and_fetch_transaction

bdb = BigchainDB(BDB_SERVER_URL)

print(bdb.info())

alice = generate_keypair()
bob = generate_keypair()
carly = generate_keypair()

tx_create_alice_simple = bdb.transactions.prepare(
    operation='CREATE',
    signers=alice.public_key,
    asset={'data':
               {'asset_message': 'I will stick to every future transfer transaction'}
           },
    metadata={'metadata_message': 'I am specific to this create transaction'}
)
tx_create_alice_simple_signed = bdb.transactions.fulfill(
    tx_create_alice_simple, private_keys=alice.private_key)

print('Posting signed transaction{}'.format(tx_create_alice_simple_signed))
res = bdb.transactions.send(tx_create_alice_simple_signed)
poll_status_and_fetch_transaction(tx_create_alice_simple_signed['id'], driver=bdb)

tx_create_alice_divisible = bdb.transactions.prepare(
    operation='CREATE',
    signers=alice.public_key,
    recipients=[([alice.public_key], 4)],
    asset={'data':
               {'asset_message': 'I will stick to every future transfer transaction'}
           },
    metadata={'metadata_message': 'I am specific to this create transaction'}
)

tx_create_alice_divisible_signed = bdb.transactions.fulfill(
    tx_create_alice_divisible, private_keys=alice.private_key)

print('Posting signed transaction{}'.format(tx_create_alice_divisible))
res = bdb.transactions.send(tx_create_alice_divisible_signed)
poll_status_and_fetch_transaction(tx_create_alice_divisible['id'], driver=bdb)
