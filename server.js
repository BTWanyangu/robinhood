import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow CORS from Chrome extensions + localhost
app.use(
  cors({
    origin: [
      "chrome-extension://fojfmnlkoopabheombodngkpajcjmhlk", // your extension ID
      "http://localhost:3000", // for testing
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// WebSocket server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

// Create HTTP server to upgrade to WebSocket
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

// Handle POSTs from the extension
app.use(express.json());
app.post("/api/data", (req, res) => {
  const data = req.body;
  console.log("📩 Received from extension:", data);

  for (const client of clients) {
   if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  }

  res.json({ ok: true });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
