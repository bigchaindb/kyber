all: build init start

build:
	docker-compose build rdb
	docker-compose build bdb-server
	docker-compose build examples-client-frontend

init: reinit_db

start:
	docker-compose up -d bdb-server
	docker-compose up -d examples-client-frontend

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