# Kyber: Tutorials, Examples and Experiments with BigchainDB

## What?! ¯\\\_(ツ)_/¯

### BigchainDB

Getting started with BigchainDB? Have a look at our docs:

- the [HTTP API](https://docs.bigchaindb.com/projects/server/en/latest/drivers-clients/http-client-server-api.html)
- a [Python Driver](https://docs.bigchaindb.com/projects/py-driver/en/latest/index.html)
- a (minimal) [JS Driver](https://github.com/bigchaindb/kyber/tree/master/drivers/javascript) for creating transactions

### Kyber 

Welcome to the BigchainDB application laboratory!

Kyber is a full suite of BigchainDB repo's including:
- BigchainDB server
- BigchainDB drivers (python, JavaScript)
- Examples and Tutorials

All versions of the above:
- Are in sync with the master branch of each BigchainDB repo
- Might have experimental features (watch out that you don't burn yourself ;-) )


## Install, run

### Quickstart with Docker (Windows, OSX, lazy Linux)

#### Prequisites

You must have `docker`, `docker-compose` (and `make`) installed.
These versions or higher should work:

- `docker`: `v1.13.0`
- `docker-compose`: `v1.7.1`

#### Launch services with make
To spin up the services, simple run the make command, which will orchestrate `docker-compose`

```
make
```

If you already built the images and want to start them:

```
make restart
```

Stop the containers:

```
make stop
```

#### Launch services manually

No make? Launch the services manually:

Launch RethinkDB:

```
docker-compose up -d rdb
```

Wait about 10 seconds and then launch the server:

```
docker-compose up -d bdb-server
```
