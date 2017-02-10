all: build init start

build:
	docker-compose build

init: reinit_db

start:
	docker-compose up -d bdb-server
	docker-compose up -d bdb-server-kyber
	docker-compose up -d nginx

restart: init start

drop_db:
	docker-compose stop rdb
	docker-compose rm -f rdb

start_db:
	docker-compose up -d rdb

run: init start

reinit_db: drop_db start_db
	sleep 10

stop:
	docker-compose down
