FROM python:3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN pip install --upgrade pip

COPY examples /usr/src/app/examples
COPY bigchaindb-server /usr/src/app/bigchaindb-server

WORKDIR /usr/src/app/bigchaindb-server

RUN pip install -e .[dev]

WORKDIR /usr/src/app/examples

RUN pip install --no-cache-dir -e .[dev]

