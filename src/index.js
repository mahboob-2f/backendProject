// require('dotenv').config()


import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config({
    path:'./.env'
})


connectDB()
.then(()=>{

    app.on("error",(error)=>{
        console.log("error after connection ", error);
    })

    app.listen(process.env.PORT || 3000 ,()=>{
        console.log(" server is listening at ",process.env.PORT);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed !!! ",error);
    
})









/*
import express from 'express';
const app = express();
( async()=>{
    try {

        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error",(error)=>{
                console.log("error : ",error );
            })
        
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening at port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("error: ",error);
    }
})();
*/