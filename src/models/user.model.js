import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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

userSchema.pre("save",async function (next){
    //  if user comes , and do chnage of name, avatar but except password then  this method
    //      call and changed the hash value of pass  so,

    if(this.isModified("password")){
        this.password = bcrypt.hash(this.password,10);
        next();
    }
    else
        next(); 
})

userSchema.methods.isPasswordCorrect = async function (password){
        return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username : this.username,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}



export const User = mongoose.model("User",userSchema);