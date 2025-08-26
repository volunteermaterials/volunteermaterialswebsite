// server.cjs
// Express API with Auth0 verification, robust logging, and uploads.
//


const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

dotenv.config();

// ---------------------------- Utilities: Logging ----------------------------
function ts() {
  return new Date().toISOString();
}
function log(level, msg, meta) {
  const rec = { t: ts(), level, msg, ...(meta || {}) };
  // Keep logs compact + parseable
  console.log(JSON.stringify(rec));
}

// ---------------------------- Config & Validation ---------------------------
const PORT = process.env.API_PORT || 8787;

// Normalize issuer to always end with '/'
const RAW_ISSUER = (process.env.AUTH0_ISSUER_BASE_URL || "").trim();
const ISSUER = RAW_ISSUER ? RAW_ISSUER.replace(/\/?$/, "/") : "";

// Accept audience with and without trailing slash (defensive against foot-guns)
const RAW_AUDIENCE = (process.env.AUTH0_AUDIENCE || "").trim();
const AUDIENCES = RAW_AUDIENCE
  ? [RAW_AUDIENCE.replace(/\/+$/, ""), RAW_AUDIENCE.replace(/\/?$/, "/")]
  : [];

if (!ISSUER) {
  log("error", "Missing env AUTH0_ISSUER_BASE_URL");
  process.exit(1);
}
if (!RAW_AUDIENCE) {
  log("error", "Missing env AUTH0_AUDIENCE");
  process.exit(1);
}

// ---------------------------- JWKS + JWT Verify -----------------------------
const jwks = jwksClient({
  jwksUri: `${ISSUER}.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: AUDIENCES, // allow with/without trailing slash
        issuer: ISSUER, // Auth0 'iss' claim ends with '/'
        algorithms: ["RS256"],
        clockTolerance: 10, // seconds
      },
      (err, decoded) => (err ? reject(err) : resolve(decoded))
    );
  });
}

// ---------------------------- App Setup -------------------------------------
const app = express();

app.use(cors()); // In prod, restrict origin by env allowlist
app.use(express.json({ limit: "2mb" }));

// Request timing + summary logger (no sensitive data)
app.use((req, res, next) => {
  const start = Date.now();
  const pathSummary = req.originalUrl.split("?")[0];
  res.on("finish", () => {
    const ms = Date.now() - start;
    log("info", "http", {
      method: req.method,
      path: pathSummary,
      status: res.statusCode,
      ms,
    });
  });
  next();
});

// Static uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ---------------------------- Auth Middlewares ------------------------------
async function requiresAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    log("warn", "auth.missing_or_malformed_authorization_header");
    return res
      .status(401)
      .json({ error: "missing_or_malformed_authorization_header" });
  }

  try {
    const decoded = await verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    // Common error names: JsonWebTokenError, TokenExpiredError, NotBeforeError
    log("warn", "auth.verify_failed", {
      name: err?.name,
      message: err?.message,
      // DO NOT log token; optionally log the 'aud'/'iss' the server expects:
      expected_issuer: ISSUER,
      expected_audiences: AUDIENCES,
    });
    return res.status(401).json({ error: "unauthorized" });
  }
}

function requiresScopes(required = []) {
  return (req, res, next) => {
    // Scopes may be in 'scope' (space-delimited) and/or 'permissions' (array)
    const scopes = typeof req.user?.scope === "string" ? req.user.scope.split(" ") : [];
    const perms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    const have = new Set([...scopes, ...perms]);
    const missing = required.filter((s) => !have.has(s));
    if (missing.length) {
      log("warn", "auth.insufficient_scope", { missing });
      return res.status(403).json({ error: "insufficient_scope", missing });
    }
    return next();
  };
}

// ---------------------------- Content Store ---------------------------------
const contentFile = path.join(__dirname, "content.json");
const defaultContent = {
  theme: { primary: "#F69321" },
  hero: {
    headline: "Building Tennessee’s Future",
    subhead:
      "Family-owned quarry & materials supplier trusted across Tennessee since 2007.",
    video: "/hero-video.mp4",
  },
  products: [
    { id: "agg-57", name: "#57 Aggregate", description: "General-purpose stone." },
    { id: "asph-b", name: "Binder Asphalt", description: "Durable base layer." },
  ],
};

async function readContent() {
  try {
    const txt = await fsp.readFile(contentFile, "utf8");
    return JSON.parse(txt);
  } catch {
    await fsp.writeFile(contentFile, JSON.stringify(defaultContent, null, 2), "utf8");
    return defaultContent;
  }
}
async function writeContent(data) {
  await fsp.writeFile(contentFile, JSON.stringify(data, null, 2), "utf8");
}

// ---------------------------- Routes ----------------------------------------

// Health/debug (safe to expose in dev only)
app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    issuer: ISSUER,
    audience_raw: RAW_AUDIENCE,
    audiences_used_for_verify: AUDIENCES,
  });
});

// Public read
app.get("/api/content", async (_req, res) => {
  try {
    const data = await readContent();
    res.json(data);
  } catch (err) {
    log("error", "content.read_failed", { message: err?.message });
    res.status(500).json({ error: "read_failed" });
  }
});

// Protected write (requires write:content)
app.put(
  "/api/content",
  requiresAuth,
  requiresScopes(["write:content"]),
  async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ error: "invalid_payload" });
      }
      await writeContent(req.body);
      res.json({ ok: true });
    } catch (err) {
      log("error", "content.write_failed", { message: err?.message });
      res.status(500).json({ error: "write_failed" });
    }
  }
);

// Debug: whoami (dev only)
app.get("/api/whoami", requiresAuth, (req, res) => {
  res.json({
    sub: req.user?.sub,
    iss: req.user?.iss,
    aud: req.user?.aud,
    scope: req.user?.scope,
    permissions: req.user?.permissions,
  });
});

// Uploads (protected)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const clean = (file.originalname || "file")
      .replace(/[/\\?%*:|"<>]/g, "_")
      .replace(/[^\w.\-]/g, "_");
    cb(null, `${ts}-${clean}`);
  },
});
const upload = multer({ storage });

app.post(
  "/api/upload",
  requiresAuth,
  requiresScopes(["write:content"]),
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "no_file" });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
  }
);

// ---------------------------- Start -----------------------------------------
app.listen(PORT, () => {
  log("info", "api.listen", {
    url: `http://localhost:${PORT}`,
    issuer: ISSUER,
    audiences: AUDIENCES,
  });
});
