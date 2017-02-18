all: build init start

build:
	docker-compose build

init: reinit_db

start:
	docker-compose up -d bdb-server
	docker-compose up -d examples-client
	docker-compose up -d nginx
	docker-compose up -d bdb-server-kyber
	docker-compose up -d examples-server-flask

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

init_examples: init_examples_accounts init_examples_assets

init_examples_accounts:
	docker-compose run --rm examples-server-flask python init_accounts.py

init_examples_assets:
	docker-compose run --rm examples-server-flask python init_assets.py