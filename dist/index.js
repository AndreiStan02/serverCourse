import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send("OK");
});
app.get("/api/metrics", (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`Hits: ${config.fileserverHits}`);
});
app.get("/api/reset", (req, res) => {
    config.fileserverHits = 0;
    res.set('Content-Type', 'text/plain');
    res.send(`${config.fileserverHits}`);
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        if (res.statusCode > 299 || res.statusCode < 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}
function middlewareMetricsInc(req, res, next) {
    res.on("finish", () => {
        config.fileserverHits++;
    });
    next();
}
