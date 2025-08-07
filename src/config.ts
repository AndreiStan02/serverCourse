import type { MigrationConfig } from "drizzle-orm/migrator";
import { url } from "inspector";
import { platform } from "os";

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

process.loadEnvFile();

type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig,
}

type APIconfig = {
    fileserverHits: number;
    platform: string;
    secret: string;
    polkaKey: string;
    db: DBConfig;
}

export let config = {
        fileserverHits : 0,
        platform: envOrThrow(process.env.PLATFORM),
        secret: envOrThrow(process.env.SECRET),
        polkaKey: envOrThrow(process.env.POLKA_KEY),
        db: {
            url: envOrThrow(process.env.DB_URL),
            migrationConfig: migrationConfig
        }
    };

function envOrThrow(key: any): string{
    if(!key){
        throw new Error("Error getting key in config.ts");
    }
    return key;
}