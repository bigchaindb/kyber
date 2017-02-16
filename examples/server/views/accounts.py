"""This module provides the blueprint for some basic API endpoints.

For more information please refer to the documentation in Apiary:
 - http://docs.bigchaindb.apiary.io/
"""
import flask
from flask_restful import Resource, reqparse

import bigchaindb
from server.models import accounts


bigchain = bigchaindb.Bigchain()


class AccountListApi(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('app', type=str,
                            choices=('ontherecord', ),
                            location='args',
                            required=True)
        app = parser.parse_args()['app']
        result = accounts.retrieve_accounts(bigchain, app)
        return flask.jsonify({
            'accounts': result
        })


class ConnectorListApi(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('app', type=str,
                            choices=('ontherecord',),
                            location='args',
                            required=True)
        parser.add_argument('ledger', type=int,
                            location='args',
                            required=True)
        app = parser.parse_args()['app']
        ledger = parser.parse_args()['ledger']
        result = accounts.get_connectors(bigchain, ledger, app)
        return flask.jsonify({
            'connectors': result
        })
