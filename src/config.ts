import dotenv from 'dotenv';
dotenv.config();

export class Config {
    public static readonly PORT: number = parseInt(process.env.PORT || '8872', 10);
    public static readonly NODE_ENV: string = process.env.NODE_ENV || 'dev';

    public static readonly DB_HOST: string = process.env.DB_HOST || 'localhost';
    public static readonly DB_PORT: number = parseInt(process.env.DB_PORT || '5432', 10);
    public static readonly DB_NAME: string = process.env.DB_NAME || 'mydatabase';
    public static readonly DB_USER: string = process.env.DB_USER || 'user';
    public static readonly DB_PASSWORD: string = process.env.DB_PASSWORD || 'password';

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
    }
}