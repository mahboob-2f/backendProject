import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:trim(),
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:trim(),
        },
        fullname:{
            type:String,
            required:true, 
            trim:trim(),
            index:true
        },
        avatar:{
            type:String ,  //   cloundary url
            required:true,

        },
        coverImage:{
            type:String,   //   cloundary url

        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",
            }
        ],
        password:{
            type:String,
            required:[true , 'Password is required'],

        },
        refreshToken:{
            type:String,
        }


    },
    {timestamps:true}
)



export const User = mongoose.model("User",userSchema);