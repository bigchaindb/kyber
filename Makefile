all: build init start

build:
	docker-compose -f docker-compose.yml build

init: reinit_db

start:
	docker-compose -f docker-compose.yml up

restart: init start

drop_db:
	docker-compose -f docker-compose.yml stop rdb
	docker-compose -f docker-compose.yml rm -f rdb

start_db:
	docker-compose -f docker-compose.yml up -d rdb

reinit_db: drop_db start_db
	sleep 10

stop:
	docker-compose -f docker-compose.yml down
