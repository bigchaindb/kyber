""" API routes definition """
from flask_restful import Api
from server.views import (
    accounts,
    assets,
    info
)


def add_routes(app):
    """ Add the routes to an app """
    for (prefix, routes) in API_SECTIONS:
        api = Api(app, prefix=prefix)
        for ((pattern, resource, *args), kwargs) in routes:
            kwargs.setdefault('strict_slashes', False)
            api.add_resource(resource, pattern, *args, **kwargs)


def r(*args, **kwargs):
    return (args, kwargs)


ROUTES_API_V1 = [
    r('/', info.RootIndex),
    r('accounts', accounts.AccountListApi),
    r('assets', assets.AssetListApi),
    r('connectors', accounts.ConnectorListApi)
]


API_SECTIONS = [
    ('/api/examples/', ROUTES_API_V1),
]
