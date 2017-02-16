from bigchaindb.models import Transaction


def create_simple_tx(user_pub, user_priv, asset=None, metadata=None):
    create_tx = Transaction.create([user_pub], [([user_pub], 1)], asset=asset, metadata=metadata)
    create_tx = create_tx.sign([user_priv])
    return create_tx
