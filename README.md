# Kyber: Tutorials, Examples and Experiments with BigchainDB

## What?! ¯\\\_(ツ)_/¯

### BigchainDB

Getting started with BigchainDB? Have a look at our docs:

- the [HTTP API](https://docs.bigchaindb.com/projects/server/en/latest/drivers-clients/http-client-server-api.html)
- a [Python driver](https://docs.bigchaindb.com/projects/py-driver/en/latest/index.html)
- a (minimal) [JavaScript driver](https://github.com/bigchaindb/kyber/tree/master/drivers/javascript) for creating transactions

### Kyber 

Welcome to the BigchainDB application laboratory!

Kyber is a full suite of BigchainDB repo's including:
- BigchainDB server
- BigchainDB drivers (python, JavaScript)
- Examples and Tutorials

All versions of the above:
- Are in sync with the master branch of each BigchainDB repo
- Might have experimental features (watch out that you don't burn yourself ;-) )


## Server-side setup

First things first. You'll need a BigchainDB server to get going with the API.
If you want run the server locally follow these steps:

Clone this repo

```bash
git clone git@github.com:bigchaindb/kyber.git 
```

and

```bash
cd kyber
```

### Quickstart with Docker (Windows, OSX, lazy Linux)

#### Prequisites

You must have `docker`, `docker-compose` (and `make`) installed.
These versions or higher should work:

- `docker`: `v1.13.0`
- `docker-compose`: `v1.7.1`

If you want to run the JavaScript tutorial, you'll need `node` and `npm`:
These versions or higher should work:

- `node`: `v6.2.2`
- `npm`: `v3.9.5`

#### Locally launch BigchainDB server and other (sometimes experimental) services 

To spin up the services, simple run the make command, which will orchestrate `docker-compose`

```bash
make
```

This might take a few minutes, perfect moment for a :coffee:!
Once docker-composed has built and launched all services, have a look:

```bash
docker-compose ps
```

```
       Name                Command          State                              Ports                             
----------------------------------------------------------------------------------------------------------------
kyber_bdb-server_1   bigchaindb start       Up      0.0.0.0:32773->9984/tcp                                      
kyber_rdb_1          rethinkdb --bind all   Up      0.0.0.0:32772->28015/tcp, 29015/tcp, 0.0.0.0:58585->8080/tcp 
...
```

Which means that the internal docker url for the API is `http://localhost:9984` 
and the external one is `http://localhost:32773`.

The external ports might change, so for the following use the ports as indicated by `docker-compose ps`.

You can simply check if it's running by going to [http://localhost:32773](http://localhost:32773).
Also you can access the RethinkDB dashboard on [http://localhost:58585](http://localhost:58585)  

If you already built the images and want to start them:

```bash
make restart
```

Stop the containers:

```bash
make stop
```

#### Launch docker-compose services manually

No make? Launch the services manually:

Launch RethinkDB:

```bash
docker-compose up -d rdb
```

Wait about 10 seconds and then launch the server:

```bash
docker-compose up -d bdb-server
```

## Run Python tutorials

Here is a list of JS tutorials:
- [simple_transactions.py](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/simple_transactions.py):
 Prepare, sign and post basic `CREATE`, `TRANSFER` transactions
- [assets_unspents.py](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/assets_unspents.py):
 Create, transfer and list assets, unspents, etc.
- [divisible_transactions.py](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/divisible_transactions.py):
 Split and combine transactions with divisible assets
- [cryptoconditions_transactions.py](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/cryptoconditions_transactions.py):
 Create custom UTXO scripts using [py-crypto-conditions](https://github.com/bigchaindb/crytoconditions)
 
Ok, so this goes well under LINUX, as most python devs know. OSX might be fine too, see the BigchainDB docs

## Run JavaScript tutorials

Here is a list of JavaScript tutorials:

- [simple_transactions.js](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/simple_transactions.js):
 Prepare, sign and post basic `CREATE`, `TRANSFER` transactions
- [assets_unspents.js](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/assets_unspents.js):
 Create, transfer and list assets, unspents, etc.
- [divisble_transactions.js](https://github.com/bigchaindb/kyber/blob/master/examples/client/tutorials/transactions/divisble_transactions.js):
 Split and combine transactions with divisible assets
- [TODO] Create custom UTXO scripts using [js-crypto-conditions](https://github.com/interledgerjs/five-bells-condition)
 
The JavaScript driver will be served from the local repo (until stable enough to appear on `npm.registry`)

This means we have to link `js-bigchaindb-quickstart` from the local `drivers/javascript`repo before install.
Here is how you do that:

```bash
cd drivers/javascript
npm install
npm link
cd ../../examples/client
npm link js-bigchaindb-quickstart
```

Now that we are in the `examples/client` directory, we can build the JavaScript tutorials.
To do this we needed to remember the external url of the API (run `docker-compose ps` in the repo root).
In our case this was `http://localhost:32773`.

We can now build the JavaScript bundles using `npm`.
Make sure you are in the `examples/client` directory first.

```bash
BDB_SERVER_URL=http:localhost:<external-docker-port> npm install
```

A few more sips of :coffee: later...

If all goes well, you'll see `webpack` spitting out the bundles. That's a good sign!

Launch webpack in `watch` mode and wait for the bundles to be emitted:

```bash
BDB_SERVER_URL=http://localhost:<external-docker-port> webpack --config webpack.config.tutorial.js -w 
```

As long as the webpack watcher is running, every code change will be trigger a new build of the affected bundle(s).

We that we have the bundles under `examples/client/build`, we're all set to inject them into a `html` file.
There are some simple webpages under `examples/client/tutorials/transactions` that can be served under the `examples/client` directory.

Due to `same-origin` policy, you'll need to start a local webserver (in another terminal) to serve the folder `examples/client`.

Here are some go-to's to server local `html` files:

- `python`: `python -m SimpleHTTPServer`
- `python3`: `python3 -m http.server`
- `node`: the `local-web-server` model see [https://www.npmjs.com/package/local-web-server](https://www.npmjs.com/package/local-web-server)

For example, using the python server uses `port:8000`. 
You can access a (blank) page that will run the JavaScript in the background:
[http://localhost:8000/tutorials/transactions/simple_transactions.html](http://localhost:8000/tutorials/transactions/simple_transactions.html)

The tutorials only use JavaScript without frontend visuals. (sorry for that, could go into the ideabox)
However statements are printed in the dev console (`F12` in the browser, and `F5` to reload)