import pytest
import random
from bigchaindb.common import crypto


TX_ENDPOINT = '/api/v1/transactions/'


@pytest.mark.bdb
@pytest.mark.usefixtures('inputs')
def test_asset_script_eval(b, client):
    from bigchaindb.models import Transaction
    import json

    user_priv, user_pub = crypto.generate_key_pair()

    tx = Transaction.create([user_pub], [([user_pub], 1)])
    tx = tx.sign([user_priv])

    block = b.create_block([tx])
    b.write_block(block)

    # vote the block valid
    vote = b.vote(block.id, b.get_last_voted_block().id, True)
    b.write_vote(vote)

    asset = {
        'script': "print(bigchain.get_outputs_filtered('{}', True))".format(user_pub)
    }

    create_tx = Transaction.create([user_pub], [([user_pub], 1)], asset=asset)
    create_tx = create_tx.sign([user_priv])

    res = client.post(TX_ENDPOINT, data=json.dumps(create_tx.to_dict()))

    transfer_tx = Transaction.transfer(create_tx.to_inputs(),
                                       [([user_pub], 1)],
                                       asset_id=create_tx.id)
    transfer_tx = transfer_tx.sign([user_priv])

    res = client.post(TX_ENDPOINT, data=json.dumps(transfer_tx.to_dict()))


@pytest.mark.bdb
@pytest.mark.usefixtures('inputs')
def test_asset_script_bad_functions(b, client):
    from bigchaindb.models import Transaction
    import json

    user_priv, user_pub = crypto.generate_key_pair()

    def execute_asset(asset):
        create_tx = Transaction.create([user_pub], [([user_pub], 1)], asset=asset)
        create_tx = create_tx.sign([user_priv])
        res = client.post(TX_ENDPOINT, data=json.dumps(create_tx.to_dict()))

    execute_asset({
        'script': "while(True): pass"
    })

    execute_asset({
        'script': "import sys; print(sys.path)"
    })