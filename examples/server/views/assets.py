"""This module provides the blueprint for some basic API endpoints.

For more information please refer to the documentation in Apiary:
 - http://docs.bigchaindb.apiary.io/
"""
import flask
from flask import request, Blueprint
from flask_restful import Resource, reqparse

import bigchaindb
from bigchaindb.web.views import parameters
from server.models import assets

api_views = Blueprint('api_views', __name__)

bigchain = bigchaindb.Bigchain()


class AssetListApi(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('public_key',
                            type=parameters.valid_ed25519,
                            location='args',
                            required=True)
        parser.add_argument('search', type=str, location='args')
        args = parser.parse_args()
        public_key = args['public_key']
        search = args['search']
        result = {
            'bigchain': assets.get_owned_assets(bigchain, vk=public_key, query=search),
            'backlog': assets.get_owned_assets(bigchain, vk=public_key, query=search, table='backlog')
        }
        return flask.jsonify({
            'assets': result,
            'account': public_key
        })

    def post(self):
        payload = request.get_json(force=True)
        tx = assets.create_asset(bigchain=bigchain,
                                 user_pub=payload['to'],
                                 user_priv=payload['priv_key'],
                                 metadata=payload['metadata'])
        return flask.jsonify(**tx)


@api_views.route('/assets/<asset_id>/<cid>/transfer/', methods=['POST'])
def transfer_asset(asset_id, cid):
    json_payload = request.get_json(force=True)
    source = json_payload.pop('source')
    to = json_payload.pop('to')

    tx = assets.transfer_asset(bigchain=bigchain,
                               source=source['vk'],
                               to=to['vk'],
                               asset_id={
                                   'txid': asset_id,
                                   'cid': int(cid)
                               },
                               sk=source['sk'])

    return flask.jsonify(**tx)


@api_views.route('/assets/<asset_id>/<cid>/escrow/', methods=['POST'])
def escrow_asset(asset_id, cid):
    json_payload = request.get_json(force=True)
    source = json_payload.pop('source')
    expires_at = json_payload.pop('expiresAt')
    ilp_header = json_payload.pop('ilpHeader', None)
    execution_condition = json_payload.pop('executionCondition')
    to = json_payload.pop('to')

    tx = assets.escrow_asset(bigchain=bigchain,
                             source=source['vk'],
                             to=to['vk'],
                             asset_id={
                                 'txid': asset_id,
                                 'cid': int(cid)
                             },
                             sk=source['sk'],
                             expires_at=expires_at,
                             ilp_header=ilp_header,
                             execution_condition=execution_condition)

    return flask.jsonify(**tx)


@api_views.route('/assets/<asset_id>/<cid>/escrow/fulfill/', methods=['POST'])
def fulfill_escrow_asset(asset_id, cid):
    json_payload = request.get_json(force=True)
    source = json_payload.pop('source')
    to = json_payload.pop('to')

    execution_fulfillment = json_payload.pop('conditionFulfillment', None)

    tx = assets.fulfill_escrow_asset(bigchain=bigchain,
                                     source=source['vk'],
                                     to=to['vk'],
                                     asset_id={
                                         'txid': asset_id,
                                         'cid': int(cid)
                                     },
                                     sk=source['sk'],
                                     execution_fulfillment=execution_fulfillment)

    return flask.jsonify(**tx)
