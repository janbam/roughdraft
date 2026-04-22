import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(__dirname, "../../app/dist");

export function createServer(port = 3000): void {
  const app = express();

  app.use(express.static(staticDir));

  // SPA fallback
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  app.listen(port, () => {
    console.log(`\n  Roughdraft running at http://localhost:${port}\n`);
  });

}
