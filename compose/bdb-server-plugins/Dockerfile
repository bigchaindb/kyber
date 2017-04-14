FROM python:3.5

RUN apt-get update && apt-get install -y python3.4 vim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN pip install --upgrade pip

COPY bigchaindb-server /usr/src/app/
COPY plugins/bigchaindb-consensus-composition /usr/src/app/plugins/bigchaindb-consensus-composition

RUN pip install --no-cache-dir -e .[dev]
RUN bigchaindb -y configure rethinkdb

WORKDIR /usr/src/app/plugins/bigchaindb-consensus-composition

RUN pip install --no-cache-dir -e .[dev]

