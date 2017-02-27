# time, id_plug, id_mobile, door_control, plugged, charge_control
import random

import pprint
from bigchaindb_driver.crypto import generate_keypair
from bigchaindb.common.utils import gen_timestamp


def generate_mock_data():
    mobile = generate_keypair()
    plug = generate_keypair()

    now = int(gen_timestamp())
    data = []

    num_samples = 6
    for i in range(num_samples+1):
        door_control = 1 if i in [0, num_samples] else 0
        plugged = 0 if i in [0, num_samples] else 1
        charge_control = random.randint(2, 10)

        data.append({
            'id_plug': plug.public_key,
            'id_mobile': mobile.public_key,
            'time': str(now + i*60),
            'door_control': str(door_control),
            'plugged': str(plugged),
            'charge_control_kw': str(charge_control)
        })
    pprint.pprint(data)

    return data, plug, mobile

if __name__ == '__main__':
    generate_mock_data()