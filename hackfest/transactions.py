import json
import sha3

from cryptoconditions import Ed25519Fulfillment, ThresholdSha256Fulfillment
from cryptoconditions.crypto import Ed25519SigningKey

from bigchaindb.models import Transaction
from bigchaindb.common.crypto import generate_key_pair
from bigchaindb.common.transaction import Output

VW_SK, VW_PK = generate_key_pair()
TEL_SK, TEL_PK = generate_key_pair()


def create_asset():
    # Create asset VW -> [VW, TEL]
    # Custom crypto condition multisig 1-2
    threshold_fulfillment = ThresholdSha256Fulfillment(threshold=1)

    vw_fulfillment = Ed25519Fulfillment(public_key=VW_PK)
    tel_fulfillment = Ed25519Fulfillment(public_key=TEL_PK)

    threshold_fulfillment.add_subfulfillment(vw_fulfillment)
    threshold_fulfillment.add_subfulfillment(tel_fulfillment)

    output = {
        'amount': 1,
        'condition': {
            'details': threshold_fulfillment.to_dict(),
            'uri': threshold_fulfillment.condition.serialize_uri()
        },
        'public_keys': [VW_PK, TEL_PK]
    }

    # Create the transaction
    tx_create = Transaction.create([VW_PK], [([VW_PK, TEL_PK], 1)])
    # Override the condition we our custom build one
    tx_create.outputs[0] = Output.from_dict(output)

    # Sign the transaction
    tx_create_signed = tx_create.sign([VW_SK])

    return tx_create_signed


def create_transfer(prev_tx):
    # Create asset VW -> [VW, TEL]
    # Custom crypto condition multisig 1-2
    threshold_fulfillment = ThresholdSha256Fulfillment(threshold=1)

    vw_fulfillment = Ed25519Fulfillment(public_key=VW_PK)
    tel_fulfillment = Ed25519Fulfillment(public_key=TEL_PK)

    threshold_fulfillment.add_subfulfillment(vw_fulfillment)
    threshold_fulfillment.add_subfulfillment(tel_fulfillment)

    output = {
        'amount': 1,
        'condition': {
            'details': threshold_fulfillment.to_dict(),
            'uri': threshold_fulfillment.condition.serialize_uri()
        },
        'public_keys': [VW_PK, TEL_PK],
    }

    # The yet to be fulfilled input:
    input_ = {
        'fulfillment': None,
        'fulfills': {
            'txid': prev_tx.id,
            'output': 0,
        },
        'owners_before': [VW_PK, TEL_PK],
    }

    # Craft the payload:
    transfer_tx = {
        'operation': 'TRANSFER',
        'asset': {'id': prev_tx.id},
        'metadata': None,
        'outputs': [output],
        'inputs': [input_],
        'version': '0.9',
    }

    # Generate the id, by hashing the encoded json formatted string
    # representation of the transaction:
    json_str_tx = json.dumps(
        transfer_tx,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False,
    )

    txid = sha3.sha3_256(json_str_tx.encode()).hexdigest()

    transfer_tx['id'] = txid

    # Sign the transaction:
    message = json.dumps(
        transfer_tx,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False,
    )

    threshold_fulfillment = ThresholdSha256Fulfillment(threshold=1)

    vw_fulfillment.sign(message.encode(), private_key=Ed25519SigningKey(VW_SK))
    threshold_fulfillment.add_subfulfillment(vw_fulfillment)
    threshold_fulfillment.add_subcondition(tel_fulfillment.condition)

    fulfillment_uri = threshold_fulfillment.serialize_uri()
    transfer_tx['inputs'][0]['fulfillment'] = fulfillment_uri
    return Transaction.from_dict(transfer_tx)
