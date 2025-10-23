import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//       importing routes
import userRouter from './routes/user.routes.js'


//   routes declaration

app.use("/api/version-1/users",userRouter);
// our url looks like =>   http://localhost:3000/api/version-1/users/register


export default app;