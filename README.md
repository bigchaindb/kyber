# DBH17: BigchainDB Kyber Version

BigchainDB opens a public API for the Dutch Blockchain Hackathon '17!

- http://vanilla.ipdb.foundation:9984/
- http://kyber.ipdb.foundation/

## What?! ¯\\\_(ツ)_/¯

### Vanilla

Meet our classic, pristine BigchainDB network running on v0.9.1.

Connect to our API using the following URL:

```
http://vanilla.ipdb.foundation:9984/
```

Getting started? Have a look at our docs:

- the [HTTP API](https://docs.bigchaindb.com/projects/server/en/latest/drivers-clients/http-client-server-api.html)
- a [Python Driver](https://docs.bigchaindb.com/projects/py-driver/en/latest/index.html)
- some [JS utilities](https://github.com/sohkai/js-bigchaindb-quickstart) for creating transactions

### Kyber

Welcome to our Hackathon Laboratory!

Our kyber version of BigchainDB will be built during this hackathon.
To say it in Dunglish: You ask, we turn! 

The repo of experimental code is here and the instance is running at:
```
http://kyber.ipdb.foundation/
```

The vanilla API is available under

```
http://kyber.ipdb.foundation/api/v1/
```

The intergalactic experimental API can be found under:

```
http://kyber.ipdb.foundation/api/kyber/
```

and the API code can be found under [bigchaindb-kyber](https://github.com/bigchaindb/DBH17/tree/master/bigchaindb-kyber)

We'll also take requests for the drivers (python and JS)... just give us a shout


#### Run locally
If you have `docker-compose` installed, you can spin it up locally:

```
make
```

If you already built the images:

```
make run
```

Stop the containers:

```
make stop
```
## What Else?

**"Make BigchainDB Big!"**

We'll be monitoring the performance of our kyber network.

The logs will be available as assets - and we're curious to see how much data will be produced during the hackathon.

Stay Tuned!
