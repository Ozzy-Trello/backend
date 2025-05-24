import { Config } from "@/config";
import { Database } from "@/types/database";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from 'pg';

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: Config.DB_NAME,
      host: Config.DB_HOST,
      user: Config.DB_USER,
      port: Config.DB_PORT,
      password: Config.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 300000,
      connectionTimeoutMillis: 5000,
    }),
  }),
  log(event) {
    if (event.level === 'query') {
      console.log(`SQL: ${event.query.sql}`);
      console.log(`Bindings: ${JSON.stringify(event.query.parameters)}`);
    }
  }
});

export default db