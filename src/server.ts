import express, { Express } from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import { Config } from "./config";

export class Server {
    private rest: Express = express();

    public restRoute() {
        this.rest.use(bodyParser.json());
        this.rest.use(cors());
        this.rest.use(morgan(Config.Env));
    }

    public start(){
        this.rest.listen(Config.Port, () => {
            console.log(`Task Management Service running on http://localhost:${Config.Port}`);
        });
    }

    public helloWorld(){
        this.rest.get('/', (req, res) => {
            res.json({
                status: 'success',
                message: 'Hello World ! This task management app is running'
            });
        })
    }
};