import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import memberRoutes from './routes/memberRoutes.js'
import relationshipRoutes from './routes/relationshipRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import mapRoutes from './routes/mapRoutes.js'
import analysisRoutes from './routes/analysisRoutes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000']

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

console.log('✅ Socket.io server initialized with CORS origins:', allowedOrigins)

const PORT = process.env.PORT || 4000

// Make io available to routes
app.set('io', io)

// Middleware
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '2mb' })) // Allow larger payloads for Base64 images
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Influencer Map API' })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/maps', mapRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/relationships', relationshipRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/analysis', analysisRoutes)

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`API endpoint: http://localhost:${PORT}/api`)
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
})

export { app, io }
