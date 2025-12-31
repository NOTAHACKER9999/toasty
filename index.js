import express from "express";
import http from "node:http";
import cors from "cors";
import path from "path";
import { hostname } from "node:os";

import { createBareServer } from "@tomphttp/bare-server-node";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const __dirname = process.cwd();

/* ------------------------
   Server + App
------------------------- */

const server = http.createServer();
const app = express(server);

/* ------------------------
   Bare Server (/b/)
------------------------- */

const bareServer = createBareServer("/b/");

/* ------------------------
   Middleware
------------------------- */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve Scramjet build files */
app.use("/scram/", express.static(scramjetPath));

/* Serve your public site */
app.use(express.static(path.join(__dirname, "public")));

/* ------------------------
   Routing (HTTP)
------------------------- */

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeRequest(req, res);
  }

  app(req, res);
});

/* ------------------------
   Routing (WebSocket)
------------------------- */

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeUpgrade(req, socket, head);
  }

  socket.end();
});

/* ------------------------
   Pages
------------------------- */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* ------------------------
   Start Server
------------------------- */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  const address = server.address();

  console.log("Listening on:");
  console.log(`  http://localhost:${address.port}`);
  console.log(`  http://${hostname()}:${address.port}`);
});

/* ------------------------
   Graceful Shutdown
------------------------- */

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("Shutting down...");
  server.close();
  bareServer.close();
  process.exit(0);
}
