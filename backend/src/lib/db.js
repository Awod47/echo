import mongoose from "mongoose"

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`connected to mongodb host ${conn.connection.host}`)
    } catch (error) {
        console.log('error connecting to mongodb', error)
        process.exit(1)
    }
}

export default connectDB