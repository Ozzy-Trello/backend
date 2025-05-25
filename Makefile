install:
	docker compose -f docker-compose.local.yml up -d
	npm install
	npm run sequelize -- db:migrate

clean-db:
	npm run sequelize -- db:migrate:undo:all

migrate-db:
	npm run sequelize -- db:migrate

delete-db:
	npm run sequelize -- db:drop

create-db:
	npm run sequelize -- db:create

re-migrate:
	npm run sequelize -- db:migrate:undo:all
	npm run sequelize -- db:migrate

run-local-docker:
	docker compose -f docker-compose.local.yml up -d

migrate:
	npm run sequelize -- db:migrate

undo-migrate:
	npm run sequelize -- db:migrate:undo

seed:
	npm run sequelize -- db:seed:all

seed-undo:
	npm run sequelize -- db:seed:undo:all

test:
	npm test