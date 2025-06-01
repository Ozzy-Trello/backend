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
import { WebSocketServer, WebSocket } from "ws";
import { createServer, Server as HttpServer } from "http";

const wsClients = new Set<WebSocket>();

export function broadcastToWebSocket(eventType: string, data: any) {
  const payload = JSON.stringify({ event: eventType, data });
  console.log(`Broadcasting to ${wsClients.size} clients:`, payload);
  
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
        wsClients.delete(client);
      }
    } else {
      wsClients.delete(client);
    }
  }
}

export class Server {
  private rest_router: Express;
  private http_server: HttpServer | null = null;
  private wss: WebSocketServer | null = null;

  constructor() {
    this.rest_router = express();
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
    this.rest_router.use(cors());
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
    const port = Config.PORT || 3000;
    
    // Create HTTP server
    this.http_server = createServer(this.rest_router);
    
    // Attach WebSocket server to the HTTP server
    this.wss = new WebSocketServer({
      server: this.http_server,
      path: "/ws"
    });

    this.wss.on("connection", (socket: WebSocket, request) => {
      console.log("New WebSocket client connected. Total clients:", wsClients.size + 1);
      wsClients.add(socket);

      // Send welcome message
      socket.send(JSON.stringify({ 
        event: "connection", 
        data: { message: "Connected to WebSocket server" } 
      }));

      socket.on("message", (rawMessage) => {
        console.log("Received message from client:", rawMessage.toString());
      });

      socket.on("close", () => {
        console.log("WebSocket client disconnected. Remaining clients:", wsClients.size - 1);
        wsClients.delete(socket);
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
        wsClients.delete(socket);
      });
    });

    // Start the HTTP server
    this.http_server.listen(port, () => {
      console.log(
        `Task Management Service (REST + WebSocket) running on http://localhost:${port}`
      );
      console.log(`WebSocket server available at ws://localhost:${port}/ws`);
    });
  }

  public async stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.http_server) {
      this.http_server.close();
    }
  }
}