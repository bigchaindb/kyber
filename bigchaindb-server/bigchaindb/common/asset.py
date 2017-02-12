import signal


class TimedOutExc(Exception):
    pass


def handler(signum, frame):
    raise TimedOutExc()


def is_clean_script(script):
    if 'bigchain.' in script:
        if 'bigchain.get_' not in script:
            return False
    return True


def validate_asset(transaction, bigchain):
    try:
        if not hasattr(transaction, 'asset'):
            raise KeyError('Asset not found in transaction {}'.format(transaction))

        asset = transaction.asset
        if not asset:
            return True

        if 'id' in asset:
            create_tx, _ = bigchain. \
                get_transaction(asset['id'], include_status=True)
            asset = create_tx.asset

        asset_data = asset['data']

        if asset_data and 'script' in asset_data:
            script = asset_data['script']

            if not is_clean_script(script):
                raise Exception('Asset script might contain malicious code')

            try:
                # do not allow builtins or other funky business
                context = {
                    'print': print,
                    'len': len
                }

                # time out after 1 second
                signal.signal(signal.SIGALRM, handler)
                signal.alarm(2)
                exec(script, {"__builtins__": context}, {'bigchain': bigchain})
                signal.alarm(0)
                return True

            except Exception as e:
                raise Exception('Asset script evaluation failed with {} : {}'
                                .format(e.__class__.__name__, e).rstrip())
        else:
            # No script, asset is always valid
            return True

    except Exception as e:
        print(e)
        return False
