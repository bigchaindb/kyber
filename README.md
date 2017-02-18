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

```bash
docker-compose ps
```

```bash
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

## Run JavaScript tutorials

The JavaScript driver will be served from the local repo (until stable enough to appear on npm.registry)

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
BDB_SERVER_URL=http:localhost:32773 npm install
```

If all goes well, you'll see `webpack` spitting out the bundles. That's a good sign!

We that we have the bundles under `examples/client/build`, we're all set to inject them into a `html` file.
There are some simple webpages under `examples/client/tutorials/transactions` that can be served under the `examples/client` directory.

Note: you'll need to start a local webserver under `examples/client` due to `same-origin` policy.

Here are some go-to's to server local `html` files:

- `python`: `python -m SimpleHTTPServer`
- `python3`: `python3 -m http.server`
- `node`: the `local-web-server` model see [https://www.npmjs.com/package/local-web-server](https://www.npmjs.com/package/local-web-server)

For example, using the python ones (`port:8000`) means you can go to 
[http://localhost:8000/tutorials/transactions/simple_transactions.html]([http://localhost:8000/tutorials/transactions/simple_transactions.html])

Other note: the tutorials only use JavaScript without frontend visuals.
However statements are printed in the dev console (`F12` in the browser, and `F5` to reload)