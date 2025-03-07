install:
	docker compose -f docker-compose.local.yml up -d
	npm install
	npm run sequelize -- db:migrate

clean-db:
	npm run sequelize -- db:migrate:undo:all

migrate-db:
	npm run sequelize -- db:migrate