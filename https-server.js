const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = process.cwd();
const PORT = 8443;
const HOST = "0.0.0.0";
const CERT_PATH = path.join(ROOT, "devcert.pfx");
const PASSPHRASE = "saturnia-dev";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const server = https.createServer(
  {
    pfx: fs.readFileSync(CERT_PATH),
    passphrase: PASSPHRASE
  },
  (req, res) => {
    try {
      const url = new URL(req.url, `https://${req.headers.host}`);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) {
        pathname += "index.html";
      }
      const safePath = path.normalize(pathname).replace(/^([/\\])/, "");
      const filePath = path.join(ROOT, safePath);
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not Found");
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      });
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server error");
    }
  }
);

server.listen(PORT, HOST, () => {
  console.log(`HTTPS server running at https://localhost:${PORT}/`);
});
