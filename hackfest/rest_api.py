from flask import Flask, jsonify, make_response, abort, request, current_app
from argparse import ArgumentParser
from logging import getLogger, Formatter, DEBUG
from logging.handlers import SysLogHandler
from bigchaindb_driver import BigchainDB
from bigchaindb_driver.exceptions import NotFoundError
from time import sleep, strftime, gmtime
from transactions import create_asset, create_transfer

app = Flask(__name__)


@app.route('/')
def index():
    return "Hello, World!"


@app.route('/tomtom', methods=['POST'])
def post_tomtom_data():
    if not request.json:
        abort(404)
    print(request.json)
    return jsonify({'ok': 1})


@app.route('/pubkey', methods=['POST'])
def post_pubkey():
    device_id = request.form.get('device_id', None)
    pubkey = request.form.get('pubkey', None)
    message = request.form.get('message', None)
    if not pubkey or not device_id:
        return jsonify({'error': 'invalid request'}), 404

    print(device_id, pubkey, message)
    return make_response(jsonify({'ok': 1}))


@app.errorhandler(404)
def not_found(error):
    """jsonify 404"""
    return make_response(jsonify({'error': 'not found'}), 404)


@app.route('/telemetry', methods=['POST'])
def handle_telemetry_data():
    if not request.json:
        abort(404)
    print(request.json)
    # parse the request?
    # should be signed req
    # can't be mangled here
    # send it to bdb as is (?!)
    json_data = request.json
    vehicle_id = request.json.pop('vehicleId')
    send_data_to_bdb(json_data, vehicle_id)
    # TODO - bubble up any errors
    return make_response(jsonify({'ok': 1}))
# end handle_telemetry_data


def init_system(app, bdb_ip, bdb_port, pub_key, pr_key):
    bdb = BigchainDB('http://{0}:{1}'.format(bdb_ip, bdb_port))
    keypair = {
        'private_key': pr_key,
        'public_key': pub_key
    }

    asset_data = {
        'data': {
            'asset_class': 'vehicle_telemetry',
            'asset_author': 'hackfest-berlin-2017-team'
        }
    }

    app.config['bdb'] = bdb
    app.config['keypair'] = keypair
    app.config['asset'] = asset_data
    app.config['txids'] = {}
# end init_system


def record_data(bdb_conn, data, metadata, keypair, tx_id, vehicle_id):
    fulfilled_tx = None
    if tx_id != '':
        logger.debug('Transfer tx!')
        previous_tx = bdb_conn.transactions.retrieve(tx_id)
        if 'id' in previous_tx['asset']:
            asset_id = previous_tx['asset']['id']
        else:
            asset_id = previous_tx['id']

        transfer_tx = create_transfer(previous_tx, keypair['private_key'],
                                      keypair['public_key'], vehicle_id,
                                      metadata, asset_id)
        bdb_conn.transactions.send(transfer_tx.to_dict())
        fulfilled_tx = transfer_tx.to_dict()
    else:
        logger.debug('Create tx!')
        create_tx = create_asset(keypair['private_key'], keypair['public_key'],
                                 vehicle_id, data, metadata)
        bdb_conn.transactions.send(create_tx.to_dict())
        fulfilled_tx = create_tx.to_dict()
    # end if

    # verify if the tx was registered in the bigchain
    trials = 0
    while trials < 10:
        try:
            if bdb_conn.transactions.status(
                    fulfilled_tx['id']
            ).get('status') == 'valid':
                print('Tx valid in:', trials, 'secs')
                break
        except NotFoundError:
            trials += 1
            sleep(1)
        # end try
    # end while

    if trials == 10:
        print('Cannot connect to backend... Exiting!')
        exit(0)
    # end if
    return fulfilled_tx['id']
# end record_data


def send_data_to_bdb(telemetry_data, vehicle_id):
    bdb = current_app.config['bdb']
    keypair = current_app.config['keypair']
    tx_id = current_app.config['txids'].get(vehicle_id, '')
    asset_data = current_app.config['asset']

    asset_metadata = {
        'company': 'vw',
        'financer': 'commerzbank',
        'owner': 'microsoft',
        'source': 'riddle_and_code',
        'dest': 'bdb',
        'timestamp': strftime('%Y-%m-%d_%H:%M:%S', gmtime()),
        'data': telemetry_data
    }

    # record data to bigchain
    tx_id = record_data(bdb, asset_data, asset_metadata, keypair, tx_id, vehicle_id)
    logger.debug('tx_id: ' + tx_id)
    current_app.config['txids'].update({vehicle_id: tx_id})
# end send_data_to_bdb


if __name__ == '__main__':
    # argument parsing
    parser = ArgumentParser(description='BDB/IoT')
    req_group = parser.add_argument_group('required arguments')
    req_group.add_argument('--bdb-ip', type=str, required=True,
                           help='bdb hostname/ip address')
    req_group.add_argument('--bdb-port', type=int, required=True,
                           help='bdb port number')
    req_group.add_argument('--public-key', type=str, required=True,
                           help='api service public key')
    req_group.add_argument('--private-key', type=str, required=True,
                           help='api service private key')
    args = parser.parse_args()
    # set up logging
    logger = getLogger('telemetry_service')
    logger.setLevel(DEBUG)
    # local syslog
    local_formatter = Formatter(
        "%(name)s %(threadName)s %(levelname)s -- %(message)s",
        datefmt='%Y-%m-%d %H:%M:%S')
    local_syslog = SysLogHandler(address='/dev/log',
                                 facility=SysLogHandler.LOG_SYSLOG)
    local_syslog.setFormatter(local_formatter)
    logger.addHandler(local_syslog)
    init_system(app, args.bdb_ip, args.bdb_port, args.public_key,
                args.private_key)
    app.run(debug=True, host='0.0.0.0')
# end main
