import dotenv from "dotenv";
dotenv.config();

export class Config {
  public static readonly Port: number = Number(process.env.PORT) || 8872;
  public static readonly Env: string = process.env.NODE_ENV || "dev";
  public static readonly DB_HOST: string = process.env.DB_HOST || "";
  public static readonly DB_PORT: number = Number(process.env.DB_PORT) || 5432;
  public static readonly DB_NAME: string = process.env.DB_NAME || "";
  public static readonly DB_USER: string = process.env.DB_USER || "";
  public static readonly DB_PASSWORD: string = process.env.DB_PASSWORD || "";
  public static readonly S3_ACCESS_KEY: string =
    process.env.S3_ACCESS_KEY || "";
  public static readonly S3_SECRET_ACCESS_KEY: string =
    process.env.S3_SECRET_ACCESS_KEY || "";
  public static readonly S3_REGION: string = process.env.S3_REGION || "";
  public static readonly S3_ENDPOINT: string = process.env.S3_ENDPOINT || "";
}
