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
    initializeAssociations();
  }

  public async checkDependencies() {
    try {
      console.log('Testing database connection...');
      await db.selectFrom("user").limit(1).execute();
      console.log("Database connection has been established successfully.");
    } catch (error) {
      throw new Error(`Unable to connect to the database: ${error}`);
    }
  }

  async restRoute() {    
    try {
      const specs = swaggerJSDoc(swaggerOption);

      this.rest_router.use(bodyParser.json());
      this.rest_router.use(cors());
      this.rest_router.use(morgan(Config.NODE_ENV));

      const routes = await rest();

      this.rest_router.use("/v1", routes);
      this.rest_router.use(
        "/",
        swaggerUi.serve,
        swaggerUi.setup(specs, {
          // customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
        })
      );
      
    } catch (error) {
      throw error;
    }
  }

  public async start() {
    const port = Config.PORT || 3000;
    
    try {
      await this.restRoute();

      this.http_server = createServer(this.rest_router);

      console.log('Setting up WebSocket server...');
      this.wss = new WebSocketServer({
        server: this.http_server,
        path: "/ws"
      });
      console.log('Setting up WebSocket connection handler...');
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
      console.log('WebSocket connection handler configured');

      console.log(`Starting HTTP server on port ${port}...`);
      
      // Wrap server.listen in a Promise to make it awaitable
      await new Promise<void>((resolve, reject) => {
        if (!this.http_server) {
          reject(new Error('HTTP server not initialized'));
          return;
        }

        const server = this.http_server.listen(port, () => {
          console.log('HTTP server listening callback executed');
          console.log(
            `Task Management Service (REST + WebSocket) running on http://localhost:${port}`
          );
          console.log(`WebSocket server available at ws://localhost:${port}/ws`);
          resolve();
        });

        server.on('error', (error) => {
          console.error('HTTP server error:', error);
          reject(error);
        });

        // Add timeout for server startup
        const timeout = setTimeout(() => {
          console.error('Server listen timeout - this usually indicates port is already in use');
          reject(new Error('Server startup timeout'));
        }, 10000);

        server.on('listening', () => {
          clearTimeout(timeout);
          console.log('Server is now listening');
        });
      });

      console.log('Server startup completed successfully!');
      
    } catch (error) {
      console.error('Error starting server:', error);
      throw error;
    }
  }

  public async stop() {
    console.log('Stopping server...');
    
    if (this.wss) {
      console.log('🔌 Closing WebSocket server...');
      this.wss.close();
    }
    
    if (this.http_server) {
      console.log('Closing HTTP server...');
      this.http_server.close();
    }
    
    console.log('Server stopped');
  }
}