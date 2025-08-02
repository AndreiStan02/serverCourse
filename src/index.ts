import express from "express";
import path from "path";

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));

app.get("/healthz", (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});