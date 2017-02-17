from bigchaindb_driver import (
    BigchainDB,
)
from bigchaindb_driver.crypto import generate_keypair

from cryptoconditions import (
    Ed25519Fulfillment,
    Fulfillment,
    PreimageSha256Fulfillment,
    ThresholdSha256Fulfillment
)
from cryptoconditions.crypto import (
    Ed25519SigningKey,
    Ed25519VerifyingKey
)

from client.tutorials.constants.application_constants import BDB_SERVER_URL
from client.tutorials.utils.bigchaindb_utils import (
    get_message_to_sign,
    poll_status_and_fetch_transaction,
    prepare_transfer,
    sign_ed25519
)
from client.tutorials.utils.cryptoconditions_utils import (
    get_subcondition,
    fulfill_subcondition
)


bdb = BigchainDB(BDB_SERVER_URL)

print(bdb.info())

alice = generate_keypair()
bob = generate_keypair()
carly = generate_keypair()


# create and assign an simple asset
tx_create_alice = bdb.transactions.prepare(
    operation='CREATE',
    signers=alice.public_key,
    recipients=[([alice.public_key], 1)],
)

tx_create_alice_divisible_signed = bdb.transactions.fulfill(
    tx_create_alice, private_keys=alice.private_key)

asset_id = tx_create_alice_divisible_signed['id']

print('Posting signed transaction{}'.format(tx_create_alice_divisible_signed))
bdb.transactions.send(tx_create_alice_divisible_signed)
poll_status_and_fetch_transaction(tx_create_alice_divisible_signed['id'], driver=bdb)

# instead of transfering to a simple public key we can craft
# custom cryptoconditions using thresholds, signatures, hashlocks, ...
# this example is a multisig between
#
#             bob     secret/hashlock
#      carly     \   /
#           \     and
#            \   /
#             and
#              |
#              o
#
#  the cryptocondition is added as an output
condition = ThresholdSha256Fulfillment(threshold=2)
condition.add_subfulfillment(Ed25519Fulfillment(public_key=Ed25519VerifyingKey(carly.public_key)))
subfulfillment = ThresholdSha256Fulfillment(threshold=2)
subfulfillment.add_subcondition(PreimageSha256Fulfillment(preimage=b'secret').condition)
subfulfillment.add_subfulfillment(Ed25519Fulfillment(public_key=Ed25519VerifyingKey(bob.public_key)))
condition.add_subfulfillment(subfulfillment)

# create the transfer transaction with the custom condition
tx_transfer_custom_condition = prepare_transfer(
        inputs=[
            {
                'tx': tx_create_alice_divisible_signed,
                'output': 0
            }
        ],
        outputs=[
            {
                'condition': condition,
                'public_keys': [bob.public_key, carly.public_key]
            },
        ]
)

tx_transfer_custom_condition_signed = sign_ed25519(tx_transfer_custom_condition, alice.private_key)

print('Posting signed transaction{}'.format(tx_transfer_custom_condition_signed))
bdb.transactions.send(tx_transfer_custom_condition_signed)
poll_status_and_fetch_transaction(tx_transfer_custom_condition_signed['id'], driver=bdb)

res = bdb.transactions.get(asset_id=asset_id)
print('Retrieve list of transactions with asset_id {}: {}'.format(asset_id, len(res)))
res = bdb.outputs.get(public_key=alice.public_key, unspent=True)
print('Retrieve list of unspent outputs with public_key {}: {}'.format(alice.public_key, len(res)))
# res = bdb.outputs.get(public_key=bob.public_key)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(bob.public_key, len(res)))
# res = bdb.outputs.get(public_key=carly.public_key, unspent=True)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(carly.public_key, len(res)))


# with custom cryptoconditions one needs to craft a custom fulfillment for the input
# start with a simple transfer transaction template
tx_transfer_custom_fulfillment = prepare_transfer(
        inputs=[
            {
                'tx': tx_transfer_custom_condition_signed,
                'output': 0
            }
        ],
        outputs=[
            {
                'condition': PreimageSha256Fulfillment(preimage=b'another secret'),
            },
        ]
)

# condition details were passed around off-chain, needs signing
# otherwise load the condition from the condition details in the output of the input_tx
fulfillment = \
    Fulfillment.from_dict(
        tx_transfer_custom_condition_signed['outputs'][0]['condition']['details']
    )
assert condition.condition_uri == fulfillment.condition_uri

# message_to_sign is the serialized transaction without the fulfillments
message_to_sign = get_message_to_sign(tx_transfer_custom_fulfillment)

# bob & carly create the fulfillment
# by signing the message with their private key
# fulfillment is updated by reference
subcondition_bob = get_subcondition(fulfillment, public_key=bob.public_key)
subcondition_bob.sign(message_to_sign, Ed25519SigningKey(bob.private_key))
# not valid yet, still a signature and a secret needed
assert condition.validate(message_to_sign) is False
subcondition_carly = get_subcondition(fulfillment, public_key=carly.public_key)
subcondition_carly.sign(message_to_sign, Ed25519SigningKey(carly.private_key))
# not valid yet, still a secret needed
assert condition.validate(message_to_sign) is False

# update a subcondition with a new subfulfillment in a nested fulfillment
# ie replace the hashlock condition by its secret fulfillment
# fulfill_subcondition returns a new fulfillment with the updated subfulfillment
fulfillment = \
    fulfill_subcondition(
        fulfillment,
        condition_uri=get_subcondition(fulfillment, type_id=PreimageSha256Fulfillment.TYPE_ID).serialize_uri(),
        new_subfulfillment=PreimageSha256Fulfillment(preimage=b'secret')
    )
assert fulfillment.validate(message_to_sign)

# update the output in the transaction with the fulfillment
tx_transfer_custom_fulfillment_signed = tx_transfer_custom_fulfillment
tx_transfer_custom_fulfillment_signed.inputs[0].fulfillment = fulfillment
tx_transfer_custom_fulfillment_signed = tx_transfer_custom_fulfillment_signed.to_dict()

print('Posting signed transaction{}'.format(tx_transfer_custom_fulfillment_signed))
bdb.transactions.send(tx_transfer_custom_fulfillment_signed)
poll_status_and_fetch_transaction(tx_transfer_custom_fulfillment_signed['id'], driver=bdb)

res = bdb.transactions.get(asset_id=asset_id)
print('Retrieve list of transactions with asset_id {}: {}'.format(asset_id, len(res)))
res = bdb.outputs.get(public_key=alice.public_key, unspent=True)
print('Retrieve list of unspent outputs with public_key {}: {}'.format(alice.public_key, len(res)))
# res = bdb.outputs.get(public_key=bob.public_key)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(bob.public_key, len(res)))
# res = bdb.outputs.get(public_key=carly.public_key, unspent=True)
# print('Retrieve list of unspent outputs with public_key {}: {}'.format(carly.public_key, len(res)))
