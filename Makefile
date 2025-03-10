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