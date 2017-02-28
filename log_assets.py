'''
__author__ = 'Krish'
'''

from argparse import ArgumentParser
from logging import getLogger, Formatter, DEBUG
from logging.handlers import SysLogHandler
import requests
import time
import bigchaindb_driver
import bigchaindb_driver.crypto


def init_system(bosun_ip, bosun_port, bdb_ip, bdb_port):
    url = 'http://{0}:{1}/api/expr'.format(bosun_ip, bosun_port)
    session = requests.Session()
    # one time init
    cpu_query = b'q("avg:rate{counter,,1}:linux.cpu{host=wildcard(*)}", "1m", "")'
    cpu_req = session.prepare_request(requests.Request(
        'POST', url, data=cpu_query))
    disk_query = b'q("avg:linux.disk.fs.space_free{host=wildcard(*)}", "1m", "")'
    disk_req = session.prepare_request(requests.Request(
        'POST', url, data=disk_query))
    # TODO hardcoded keypair
    keypair = {
        'private_key': '6H6g4c6fwc5MCDMT4cmTgDDuij9Yhr6FXVJ7G2sMoztJ',
        'public_key': 'F911cpKsZTP3Fxzx243mJqUh15CtGDTRuVBaw5xnvGXh'
    }

    asset_data = {}
    tx_id = ''
    while True:
        cpu_data = get_bdb_cpu_data(session, cpu_req)
        print(cpu_data)
        disk_data = get_bdb_disk_data(session, disk_req)
        print(disk_data)
        asset_data['cpu'] = cpu_data
        asset_data['disk'] = disk_data
        # record data to bigchain
        tx_id = record_data(asset_data, keypair, tx_id, bdb_ip, bdb_port)
        time.sleep(5)
        # end while


# end init_system

def record_data(data, keypair, tx_id, bdb_ip, bdb_port):
    metadata = {
        'timestamp': time.strftime('%Y-%m-%d_%H:%M:%S', time.gmtime()),
        'data': data
    }
    bdb = bigchaindb_driver.BigchainDB(
        'http://{0}:{1}'.format(bdb_ip, bdb_port)
    )
    fulfilled_tx = None
    if tx_id != '':
        creation_tx = bdb.transactions.retrieve(tx_id)
        if 'id' in creation_tx['asset']:
            asset_id = creation_tx['asset']['id']
        else:
            asset_id = creation_tx['id']
        # end if
        transfer_asset = {
            'id': asset_id
        }
        output_index = 0
        output = creation_tx['outputs'][output_index]
        transfer_input = {
            'fulfillment': output['condition']['details'],
            'fulfills': {
                'output': output_index,
                'txid': creation_tx['id']
            },
            'owners_before': output['public_keys']
        }
        prepared_transfer_tx = bdb.transactions.prepare(
            operation='TRANSFER',
            asset=transfer_asset,
            inputs=transfer_input,
            recipients=keypair['public_key'],
            metadata=metadata
        )
        fulfilled_tx = bdb.transactions.fulfill(
            prepared_transfer_tx,
            private_keys=keypair['private_key']
        )
        bdb.transactions.send(fulfilled_tx)
    else:
        asset = {
            'data': {
                'info':'The logging metrics'
            }
        }
        prepared_creation_tx = bdb.transactions.prepare(
            operation='CREATE',
            signers=keypair['public_key'],
            asset=asset,
            metadata=metadata
        )
        fulfilled_tx = bdb.transactions.fulfill(
            prepared_creation_tx,
            private_keys=keypair['private_key']
        )
        bdb.transactions.send(fulfilled_tx)
    # end if

    # verify if the tx was registered in the bigchain
    trials = 0
    while trials < 60:
        try:
            if bdb.transactions.status(
                    fulfilled_tx['id']
            ).get('status') == 'valid':
                print('Tx valid in:', trials, 'secs')
                break
        except bigchaindb_driver.exceptions.NotFoundError:
            trials += 1
            time.sleep(1)
            # end try
    # end while
    if trials == 60:
        print('Tx is stuck?!... Bye!')
        exit(0)
    # end if
    return fulfilled_tx['id']
# end record_data

def get_bdb_data(session, req):
    bdb_data = {}
    try:
        response = session.send(req)
        assert (response.status_code == 200)
        assert (response.headers['content-type'] == 'application/json')
        data = response.json()
        results = data['Results']
        for result in results:
            # TODO hardcoded hostnames below
            if result['Group']['host'] in ['ip-172-31-13-246',
                                           'ip-172-31-9-137',
                                           'ip-172-31-0-90']:
                avg = 0.0
                # find avg usage
                for reading in result['Value'].values():
                    avg = (avg + reading) / 2
                # end for
                bdb_data[result['Group']['host']] = str(avg)
                # end for
    except requests.ConnectionError as err:
        print(err)
    return bdb_data


# end get_bdb_data


def get_bdb_cpu_data(session, cpu_req):
    ## get CPU data
    return get_bdb_data(session, cpu_req)


# end get_bdb_cpu_data


def get_bdb_disk_data(session, disk_req):
    ## get Disk data
    return get_bdb_data(session, disk_req)


# end get_bdb_disk_data


if __name__ == '__main__':
    # argument parsing
    parser = ArgumentParser(description='BDB/IoT')
    req_group = parser.add_argument_group('required arguments')
    req_group.add_argument('--bosun-ip', type=str, required=True,
                           help='bosun hostname/ip address')
    req_group.add_argument('--bosun-port', type=int, required=True,
                           help='bosun port number')
    req_group.add_argument('--bdb-ip', type=str, required=True,
                           help='bdb hostname/ip address')
    req_group.add_argument('--bdb-port', type=int, required=True,
                           help='bdb port number')
    args = parser.parse_args()
    # set up logging
    logger = getLogger('update_client')
    logger.setLevel(DEBUG)
    # local syslog
    local_formatter = Formatter(
        "%(name)s %(threadName)s %(levelname)s -- %(message)s",
        datefmt='%Y-%m-%d %H:%M:%S')
    local_syslog = SysLogHandler(address='/dev/log',
                                 facility=SysLogHandler.LOG_SYSLOG)
    local_syslog.setFormatter(local_formatter)
    logger.addHandler(local_syslog)
    init_system(args.bosun_ip, args.bosun_port, args.bdb_ip, args.bdb_port)
# end main
