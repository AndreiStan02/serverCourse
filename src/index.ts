import express from "express";

import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { config } from "./config.js";

import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
  errorMiddleWare,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerChirpsCreate, handlerChirpsGetAll, handlerChirpsGetById, handlerDeleteChirp } from "./api/chirps.js";
import { handlerCreateUser, handlerEditUser, handlerUpgradeUser, handlerUserLogin } from "./api/users.js";
import { handlerRefresh, handlerRevoke } from "./api/users.js";

const app = express();
const PORT = 8080;

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsGetAll(req, res)).catch(next);
});

app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerChirpsGetById(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsCreate(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerUserLogin(req, res)).catch(next);
})

app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerRefresh(req, res)).catch(next);
})

app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerRevoke(req, res)).catch(next);
})

app.post("/api/polka/webhooks", (req, res, next) => {
  Promise.resolve(handlerUpgradeUser(req, res)).catch(next);
})

app.put("/api/users", (req, res, next) => {
  Promise.resolve(handlerEditUser(req, res)).catch(next);
})

app.delete("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
})

app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});