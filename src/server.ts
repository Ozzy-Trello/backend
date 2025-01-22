import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import db from "@/database/connections";
import { Config } from "@/config";

export class Server {
	private rest: Express = express();

	constructor() {
		this.restRoute()
	}

	public async checkDependencies() {
		try {
			await db.authenticate();
			console.log('Database connection has been established successfully.');
		} catch (error) {
			throw new Error(`Unable to connect to the database: ${error}`);
		}
	}

	restRoute() {
		this.rest.use(bodyParser.json());
		this.rest.use(cors());
		this.rest.use(morgan(Config.NODE_ENV));

		this.rest.get('/', (req, res) => {
			res.json({
				status: 'success',
				message: 'Hello World ! This task management app is running with CICD'
			});
		})
	}

	public async start() {
		this.rest.listen(Config.PORT, () => {
			console.log(`Task Management Service running on http://localhost:${Config.PORT}`);
		});
	}
};
