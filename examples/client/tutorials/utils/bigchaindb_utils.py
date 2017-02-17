from time import sleep
import bigchaindb_driver.exceptions


def get_connection_default():
    from bigchaindb_driver import BigchainDB
    from client.tutorials.constants.application_constants import BDB_SERVER_URL
    return BigchainDB(BDB_SERVER_URL)


def poll_status_and_fetch_transaction(txid, driver=None):
    if not driver:
        driver = get_connection_default()
    trials = 0
    tx_retrieved = None
    while trials < 100:
        try:
            res = driver.transactions.status(txid)
            print("Fetched transaction status: {}".format(res))
            if res.get('status') == 'valid':
                tx_retrieved = driver.transactions.retrieve(txid)
                print("Fetched transaction", tx_retrieved)
                break
        except bigchaindb_driver.exceptions.NotFoundError:
            trials += 1
        sleep(0.5)
    return tx_retrieved


def prepare_transfer(inputs, outputs, metadata=None):
    """Create an instance of a :class:`~.Output`.

    Args:
        inputs (list of
                    (dict):
                        {
                            'tx': <(bigchaindb.common.transactionTransaction):
                                    input transaction, can differ but must have same asset id>,
                            'output': <(int): output index of tx>
                        }
                )
        outputs (list of
                    (dict):
                        {
                            'condition': <(cryptoconditions.Condition): output condition>,
                            'public_keys': <(optional list of base58): for indexing defaults to `None`>,
                            'amount': <(int): defaults to `1`>
                        }
                )
        metadata (dict)
    Raises:
        TypeError: if `public_keys` is not instance of `list`.
            """
    from bigchaindb.common.transaction import (
        Input,
        Output,
        Transaction,
        TransactionLink
    )
    from cryptoconditions import (
        Fulfillment,
        Condition
    )

    asset = inputs[0]['tx']['asset']
    asset = {
        'id': asset['id'] if 'id' in asset else inputs[0]['tx']['id']
    }

    _inputs, _outputs = [], []

    for _input in inputs:

        _output = _input['tx']['outputs'][_input['output']]
        _inputs.append(
            Input(
                fulfillment=Condition.from_uri(_output['condition']['uri']),
                owners_before=_output['public_keys'],
                fulfills=TransactionLink(
                    txid=_input['tx']['id'],
                    output=_input['output'])
            )
        )

    for output in outputs:
        _outputs.append(
            Output(
                fulfillment=output['condition'],
                public_keys=output['public_keys'] if "public_keys" in output else None,
                amount=output['amount'] if "amount" in output else 1
            )
        )

    return Transaction(
        operation='TRANSFER',
        asset=asset,
        inputs=_inputs,
        outputs=_outputs,
        metadata=metadata,
    )


def prepare_transfer_ed25519_simple(transaction, receiver, metadata=None):
    from cryptoconditions import Ed25519Fulfillment
    from cryptoconditions.crypto import Ed25519VerifyingKey

    return prepare_transfer(
        inputs=[
            {
                'tx': transaction,
                'output': 0
            }
        ],
        outputs=[
            {
                'condition': Ed25519Fulfillment(public_key=Ed25519VerifyingKey(receiver)),
                'public_keys': [receiver],
                'amount': 1
            }
        ],
        metadata=metadata)


def sign_ed25519(transaction, private_keys):
    from cryptoconditions import Ed25519Fulfillment
    from cryptoconditions.crypto import Ed25519VerifyingKey

    for index, _input in enumerate(transaction.inputs):
        receiver = _input.owners_before[0]
        transaction.inputs[index].fulfillment = Ed25519Fulfillment(
            public_key=Ed25519VerifyingKey(receiver)
        )

    private_keys = [private_keys] if not isinstance(private_keys, list) else private_keys
    return transaction.sign(private_keys).to_dict()
