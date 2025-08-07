const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
process.loadEnvFile();
export let config = {
    fileserverHits: 0,
    platform: envOrThrow(process.env.PLATFORM),
    secret: envOrThrow(process.env.SECRET),
    polkaKey: envOrThrow(process.env.POLKA_KEY),
    db: {
        url: envOrThrow(process.env.DB_URL),
        migrationConfig: migrationConfig
    }
};
function envOrThrow(key) {
    if (!key) {
        throw new Error("Error getting key in config.ts");
    }
    return key;
}
