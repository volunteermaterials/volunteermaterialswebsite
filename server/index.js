// server/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { fileURLToPath } from 'url'

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---- Config
const PORT = process.env.API_PORT || 8787
const ISSUER = process.env.AUTH0_ISSUER_BASE_URL   
const AUDIENCE = process.env.AUTH0_AUDIENCE         
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads')
const CONTENT_FILE = path.join(__dirname, 'content.json')

// Ensure uploads dir
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// ---- Auth0 JWT verification
const client = jwksClient({
  jwksUri: `${ISSUER}.well-known/jwks.json`
})

function getKey(header, cb) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err)
    const signingKey = key.getPublicKey()
    cb(null, signingKey)
  })
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing token' })

  jwt.verify(
    token,
    getKey,
    {
      audience: AUDIENCE,
      issuer: ISSUER,
      algorithms: ['RS256']
    },
    (err, decoded) => {
      if (err) return res.status(401).json({ error: 'invalid token' })
      req.user = decoded
      next()
    }
  )
}

// ---- Storage helpers
function readContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
    }
  } catch {}
  return {}
}

function saveContent(obj) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(obj, null, 2))
}

// ---- Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ''
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase()
    cb(null, `${base}-${Date.now()}${ext}`)
  }
})
const upload = multer({ storage })

// ---- App
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve static files (uploads) so returned URLs work in dev
app.use('/uploads', express.static(UPLOAD_DIR))

// Routes
app.get('/api/content', (req, res) => {
  const current = readContent()
  res.json(current)
})

app.put('/api/content', requireAuth, (req, res) => {
  const body = req.body || {}
  saveContent(body)
  res.json({ ok: true })
})

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'no file' })
  // URL that the client can use
  const url = `/uploads/${file.filename}`
  res.json({ url })
})

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`)
})
