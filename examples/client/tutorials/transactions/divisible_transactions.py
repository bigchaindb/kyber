from bigchaindb_driver import (
    BigchainDB,
)
from bigchaindb_driver.crypto import generate_keypair

from cryptoconditions import Ed25519Fulfillment
from cryptoconditions.crypto import Ed25519VerifyingKey

from client.tutorials.constants.application_constants import BDB_SERVER_URL
from client.tutorials.utils.bigchaindb_utils import (
    poll_status_and_fetch_transaction,
    prepare_transfer,
    sign_ed25519
)

bdb = BigchainDB(BDB_SERVER_URL)

print(bdb.info())

alice = generate_keypair()
bob = generate_keypair()
carly = generate_keypair()

tx_create_alice_divisible = bdb.transactions.prepare(
    operation='CREATE',
    signers=alice.public_key,
    recipients=[([alice.public_key], 4)],
)

tx_create_alice_divisible_signed = bdb.transactions.fulfill(
    tx_create_alice_divisible, private_keys=alice.private_key)

asset_id = tx_create_alice_divisible_signed['id']

print('Posting signed transaction{}'.format(tx_create_alice_divisible_signed))
res = bdb.transactions.send(tx_create_alice_divisible_signed)
poll_status_and_fetch_transaction(tx_create_alice_divisible_signed['id'], driver=bdb)


tx_transfer_divisible = prepare_transfer(
        inputs=[
            {
                'tx': tx_create_alice_divisible_signed,
                'output': 0
            }
        ],
        outputs=[
            {
                'condition': Ed25519Fulfillment(public_key=Ed25519VerifyingKey(carly.public_key)),
                'public_keys': [carly.public_key],
                'amount': 2
            },
            {
                'condition': Ed25519Fulfillment(public_key=Ed25519VerifyingKey(bob.public_key)),
                'public_keys': [bob.public_key],
                'amount': 1
            },
            {
                'condition': Ed25519Fulfillment(public_key=Ed25519VerifyingKey(alice.public_key)),
                'public_keys': [alice.public_key],
                'amount': 1
            }
        ]
)

tx_transfer_divisible_signed = sign_ed25519(tx_transfer_divisible, alice.private_key)

print('Posting signed transaction{}'.format(tx_transfer_divisible_signed))
bdb.transactions.send(tx_transfer_divisible_signed)
poll_status_and_fetch_transaction(tx_transfer_divisible_signed['id'], driver=bdb)

res = bdb.transactions.get(asset_id=asset_id)
print('Retrieve list of transactions with asset_id {}: {}'.format(asset_id, len(res)))
# res = bdb.outputs.get(public_key=alice.public_key, unspent=True)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(alice.public_key, len(res)))
# res = bdb.outputs.get(public_key=bob.public_key)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(bob.public_key, len(res)))
# res = bdb.outputs.get(public_key=carly.public_key, unspent=True)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(carly.public_key, len(res)))

tx_transfer_divisible = prepare_transfer(
        inputs=[
            {
                'tx': tx_transfer_divisible_signed,
                'output': 0
            },
            {
                'tx': tx_transfer_divisible_signed,
                'output': 1
            }
        ],
        outputs=[
            {
                'condition': Ed25519Fulfillment(public_key=Ed25519VerifyingKey(bob.public_key)),
                'public_keys': [carly.public_key],
                'amount': 1
            },
            {
                'condition': Ed25519Fulfillment(public_key=Ed25519VerifyingKey(carly.public_key)),
                'public_keys': [bob.public_key],
                'amount': 2
            }
        ]
)

tx_transfer_divisible_signed = sign_ed25519(tx_transfer_divisible, [bob.private_key, carly.private_key])
print('Posting signed transaction{}'.format(tx_transfer_divisible_signed))
bdb.transactions.send(tx_transfer_divisible_signed)
poll_status_and_fetch_transaction(tx_transfer_divisible_signed['id'], driver=bdb)

res = bdb.transactions.get(asset_id=asset_id)
print('Retrieve list of transactions with asset_id {}: {}'.format(asset_id, len(res)))
# res = bdb.outputs.get(public_key=alice.public_key, unspent=True)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(alice.public_key, len(res)))
# res = bdb.outputs.get(public_key=bob.public_key)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(bob.public_key, len(res)))
# res = bdb.outputs.get(public_key=carly.public_key, unspent=True)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(carly.public_key, len(res)))
