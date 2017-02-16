""" API Index endpoint """

import flask
from flask_restful import Resource


class RootIndex(Resource):
    def get(self):
        return flask.jsonify({
            'version': 'examples'
        })
