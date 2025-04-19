import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'

import connectDB from './lib/db.js'

dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`)
    connectDB()
})