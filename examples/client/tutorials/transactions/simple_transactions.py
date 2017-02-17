from bigchaindb_driver import (
    BigchainDB,
)
from bigchaindb_driver.crypto import generate_keypair

from client.tutorials.constants.application_constants import BDB_SERVER_URL
from client.tutorials.utils.bigchaindb_utils import (
    poll_status_and_fetch_transaction,
    prepare_transfer_ed25519_simple,
    sign_ed25519
)


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

asset_id = tx_create_alice_simple_signed['id']

print('Posting signed transaction{}'.format(tx_create_alice_simple_signed))
res = bdb.transactions.send(tx_create_alice_simple_signed)
poll_status_and_fetch_transaction(tx_create_alice_simple_signed['id'], driver=bdb)

print('Posting signed transaction{}'.format(tx_create_alice_simple_signed))
bdb.transactions.send(tx_create_alice_simple_signed)
poll_status_and_fetch_transaction(tx_create_alice_simple_signed['id'], driver=bdb)

tx_transfer_bob = prepare_transfer_ed25519_simple(
    transaction=tx_create_alice_simple_signed,
    receiver=bob.public_key,
    metadata={'metadata_message': 'I am specific to this transfer transaction'})
tx_transfer_bob_signed = sign_ed25519(tx_transfer_bob, alice.private_key)

print('Posting signed transaction{}'.format(tx_transfer_bob_signed))
bdb.transactions.send(tx_transfer_bob_signed)
poll_status_and_fetch_transaction(tx_transfer_bob_signed['id'], driver=bdb)

res = bdb.transactions.get(asset_id=asset_id)
print('Retrieve list of transactions with asset_id {}: {}'.format(asset_id, len(res)))
res = bdb.outputs.get(public_key=alice.public_key, unspent=True)
print('Retrieve list of unspent outputs with public_key {}: {}'.format(alice.public_key, len(res)))
res = bdb.outputs.get(public_key=bob.public_key)
print('Retrieve list of unspent outputs with public_key {}: {}'.format(bob.public_key, len(res)))
res = bdb.outputs.get(public_key=carly.public_key, unspent=True)
print('Retrieve list of unspent outputs with public_key {}: {}'.format(carly.public_key, len(res)))
