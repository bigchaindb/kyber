from argparse import ArgumentParser
from logging import getLogger, Formatter, DEBUG
from logging.handlers import SysLogHandler
from bigchaindb_driver import BigchainDB
from json import dumps as json_dumps
from time import strftime, gmtime


class Provenance(object):
    def __init__(self, log, bdb_ip, bdb_port, public_key, private_key,
                 file_path):
        self.bdb = BigchainDB('http://{0}:{1}'.format(bdb_ip, bdb_port))
        self.keypair = {
            'private_key': private_key,
            'public_key': public_key
        }
        self.file_path = file_path
        self.logger = log
    # end __init__

    def start(self):
        # open the csv file, every file is an asset
        asset = {}
        asset['asset_class'] = 'lungo_tavolo_product'
        with open(self.file_path) as fh:
            # ignore the headers for now
            fh.readline()
            for line in fh:
                columns = line.split(',')
                # sanitize the columns, remove null strings
                new_columns = []
                for cell in columns:
                    if cell != '':
                        cell = cell.rstrip('\r\n')
                        new_columns.append(cell)
                    # end if
                # end for
                # define the asset
                # remove '.' from the column[0] as mongo does not allow '.'
                # in key fields: http://stackoverflow.com/questions/28664383/mongodb-not-allowing-using-in-key
                new_columns[0] = new_columns[0].replace('.', '')
                asset[new_columns[0]] = ','.join(new_columns[1:])
            # end for
            self.logger.debug(json_dumps(asset))
        # end with
        # defin the metadata
        asset_metadata = {
            'from_file': self.file_path,
            'create_at': strftime('%Y-%m-%d_%H:%M:%S', gmtime()),
        }
        # send to bdb
        self.send_to_bdb(asset, asset_metadata)
    # end start

    def send_to_bdb(self, asset, metadata):
        bdb_asset = {
            'data': asset
        }
        prepared_creation_tx = self.bdb.transactions.prepare(
            operation='CREATE',
            signers=self.keypair['public_key'],
            asset=bdb_asset,
            metadata=metadata
        )
        fulfilled_tx = self.bdb.transactions.fulfill(
            prepared_creation_tx,
            private_keys=self.keypair['private_key']
        )
        self.bdb.transactions.send(fulfilled_tx)
        self.logger.debug(fulfilled_tx['id'])
    # end send_to_bdb
# end class Provenance


if __name__ == '__main__':
    # argument parsing
    parser = ArgumentParser(description='BDB/LungoTavolo')
    req_group = parser.add_argument_group('required arguments')
    req_group.add_argument('--bdb-ip', type=str, required=True,
                           help='bdb hostname/ip address')
    req_group.add_argument('--bdb-port', type=int, required=True,
                           help='bdb port number')
    req_group.add_argument('--public-key', type=str, required=True,
                           help='lungo tavolo public key')
    req_group.add_argument('--private-key', type=str, required=True,
                           help='lungo tavolo private key')
    req_group.add_argument('--file', type=str, required=True,
                           help='path to csv file')
    args = parser.parse_args()
    # set up logging
    logger = getLogger('provenance_service')
    logger.setLevel(DEBUG)
    # local syslog
    local_formatter = Formatter(
        "%(name)s %(threadName)s %(levelname)s -- %(message)s",
        datefmt='%Y-%m-%d %H:%M:%S')
    local_syslog = SysLogHandler(address='/dev/log',
                                 facility=SysLogHandler.LOG_SYSLOG)
    local_syslog.setFormatter(local_formatter)
    logger.addHandler(local_syslog)

    provenance = Provenance(logger, args.bdb_ip, args.bdb_port, args.public_key,
                            args.private_key, args.file)
    provenance.start()
# end main
