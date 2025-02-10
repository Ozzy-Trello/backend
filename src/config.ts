import dotenv from "dotenv";
import * as crypto from "node:crypto";

dotenv.config();

export class Config {
  public static readonly PORT: number = Number(process.env.PORT) || 8872;
  public static readonly REST_KEY: string = process.env.REST_KEY || crypto.randomBytes(20).toString('hex');
  public static readonly NODE_ENV: string = process.env.NODE_ENV || "dev";
  public static readonly DB_HOST: string = process.env.DB_HOST || "";
  public static readonly DB_PORT: number = Number(process.env.DB_PORT) || 5432;
  public static readonly DB_NAME: string = process.env.DB_NAME || "";
  public static readonly DB_USER: string = process.env.DB_USER || "";
  public static readonly DB_PASSWORD: string = process.env.DB_PASSWORD || "";
  public static readonly S3_ACCESS_KEY: string = process.env.S3_ACCESS_KEY || "";
  public static readonly S3_SECRET_ACCESS_KEY: string = process.env.S3_SECRET_ACCESS_KEY || "";
  public static readonly S3_REGION: string = process.env.S3_REGION || "";
  public static readonly S3_ENDPOINT: string = process.env.S3_ENDPOINT || "";

  static {
      if (!process.env.DB_HOST) {
          console.warn('DB_HOST not loaded from .env we are using default: localhost');
      }
      if (!process.env.DB_PORT) {
          console.warn('DB_PORT not loaded from .env we are using default: 5432');
      }
      if (!process.env.PORT) {
          console.warn('PORT not loaded from .env we are using default: 8872');
      }

      if (!this.S3_ACCESS_KEY || !this.S3_SECRET_ACCESS_KEY || !this.S3_REGION || !this.S3_ENDPOINT) {
        throw new Error("Missing S3 environment variables");
      }
  }
}
