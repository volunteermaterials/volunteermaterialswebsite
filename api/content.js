// vercel serverless, Node 18+
// npm i jsonwebtoken jwks-rsa
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({ jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}.well-known/jwks.json` });

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function requireAuth(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${process.env.AUTH0_ISSUER_BASE_URL}`,
      algorithms: ["RS256"]
    }, (err, decoded) => {
      if (err) return reject(err);
      // Optional: check role in decoded.permissions / custom claim
      resolve(decoded);
    });
  });
}

const CONTENT_BUCKET = process.env.CONTENT_BUCKET || ""; // or just keep JSON in Vercel KV/Upstash/DB
import fs from "fs/promises";
const CONTENT_PATH = "/tmp/content.json"; // scratch file

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const buf = await fs.readFile(CONTENT_PATH, "utf8").catch(() => null);
      if (!buf) return res.status(200).json(require("./defaultContent.json"));
      return res.status(200).json(JSON.parse(buf));
    } catch (e) { return res.status(200).json(require("./defaultContent.json")); }
  }

  if (req.method === "PUT") {
    try { await requireAuth(req); } catch { return res.status(401).json({ error: "Unauthorized" }); }
    const body = await new Promise(r => {
      let s = ""; req.on("data", c => s += c); req.on("end", () => r(s));
    });
    await fs.writeFile(CONTENT_PATH, body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
