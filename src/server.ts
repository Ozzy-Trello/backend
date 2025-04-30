import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { options as swaggerOption } from "@/views/rest/swagger";

import db from "@/database";
import { Config } from "@/config";

import rest from "@/routes/rest";
import { initializeAssociations } from "./database/associations";

export class Server {
  private rest_router: Express = express();

  constructor() {
    this.restRoute();
    initializeAssociations();
  }

  public async checkDependencies() {
    try {
      await db.selectFrom("user").limit(1).execute();
      console.log("Database connection has been established successfully.");
    } catch (error) {
      throw new Error(`Unable to connect to the database: ${error}`);
    }
  }

  restRoute() {
    const specs = swaggerJSDoc(swaggerOption);

    this.rest_router.use(bodyParser.json());

    const corsOptions = {
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "https://dev-workflow-ozzy.netlify.app/",
      ], // Add any frontend origins
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["*"],
    };

    // Apply CORS first - before any other middleware
    this.rest_router.use(cors());

    // Explicit handling for OPTIONS preflight requests
    this.rest_router.options("*", cors(corsOptions));
    this.rest_router.use(morgan(Config.NODE_ENV));

    this.rest_router.use("/v1", rest());
    this.rest_router.use(
      "/",
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        // customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
      })
    );
  }

  public async start() {
    this.rest_router.listen(Config.PORT, () => {
      console.log(
        `Task Management Service running on http://localhost:${Config.PORT}`
      );
    });
  }
}
