import express, { Express } from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import db from "@/schemas/connections";
import { Config } from "@/config";

export class Server {
    private rest: Express = express();

    constructor(){
        this.restRoute()
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

        db.authenticate().then(() => {
            console.log('Connection has been established successfully.');
        }).catch((error) => {
            throw new Error(`Unable to connect to the database: ${error} = ${Config.DB_HOST}:${Config.DB_PORT}/${Config.DB_NAME}(${Config.DB_USER}:${Config.DB_PASSWORD})`);
        });
    }

    public start(){
        this.rest.listen(Config.PORT, () => {
            console.log(`Task Management Service running on http://localhost:${Config.PORT}`);
        });
    }
};