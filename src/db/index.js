import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async()=>{
    console.log(process.env.MONGODB_URL);
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! \n DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGOBD Connection error :  ",error);
    }
}

export default connectDB;