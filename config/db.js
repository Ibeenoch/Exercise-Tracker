import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

export const connectDb = async() => {
    const dataBaseUrl = process.env.MONGODB_URL;
    console.log('db url ', dataBaseUrl)
    try {
      const conn =await mongoose.connect(dataBaseUrl);
      console.log(`mongodb connected on ${conn.connection.host}`)
    
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}