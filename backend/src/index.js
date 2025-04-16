import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/auth', authRoutes)

app.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`)
    connectDB()
})