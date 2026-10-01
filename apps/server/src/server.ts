import "dotenv/config";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import { app } from "./app.js";

// Load environment variables from .env file
const HTTPS_PORT = Number(process.env.PORT) || 3000;

// Optional HTTP redirect port for redirecting HTTP traffic to HTTPS
const HTTP_REDIRECT_PORT = process.env.HTTP_REDIRECT_PORT
  ? Number(process.env.HTTP_REDIRECT_PORT)
  : undefined;
  
// Ensure that TLS key and certificate paths are provided in the environment variables
const TLS_KEY_PATH = process.env.TLS_KEY_PATH;
const TLS_CERT_PATH = process.env.TLS_CERT_PATH;

// Validate that the TLS key and certificate paths are set before starting the HTTPS server
if (!TLS_KEY_PATH || !TLS_CERT_PATH) {
  throw new Error(
    'TLS_KEY_PATH and TLS_CERT_PATH must be configured to start the HTTPS server.',
  );
}

// Create an HTTPS server using the provided TLS key and certificate, and start listening on the specified HTTPS port.
const httpsServer = https.createServer(
  {
    key: fs.readFileSync(TLS_KEY_PATH),
    cert: fs.readFileSync(TLS_CERT_PATH),
  },
  app,
);

// Start the HTTPS server and log the URL where the CareerConnect API is running.
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`CareerConnect API running on https://localhost:${HTTPS_PORT}`);
});

// If an HTTP redirect port is specified, create an HTTP server that redirects all incoming HTTP requests to the HTTPS server.
if (HTTP_REDIRECT_PORT !== undefined) {
  http.createServer((req, res) => {
    const host = req.headers.host?.split(':')[0] ?? 'localhost';
    const location = `https://${host}:${HTTPS_PORT}${req.url ?? '/'}`;

    res.writeHead(308, { Location: location });
    res.end();
  }).listen(HTTP_REDIRECT_PORT, () => {
    console.log(`HTTP requests redirect to HTTPS on port ${HTTP_REDIRECT_PORT}`);
  });
}