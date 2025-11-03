import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from 'jsonwebtoken'


export const verifyJWT= asyncHandler(async(req,res,next)=>{

    try {
        const token = req.cookies?.accessToken ||       //  accessToken from cookies
            req.header("Authorization")?.replace("Bearer ","")   //  or else from request header
    
    
        if(!token){
            throw new ApiError(401,"Unauthorised request"); 
        }
    
        //    we have to verify that whether that token is there or expired  
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if(!user ){
            throw new ApiError(401,"invalid access Token");
        }

        req.user = user; 

        next();       //  => tells to move on next middleware if any if not move to next method


    } catch (error) {
        throw new ApiError(401,error?.message||"invalid access Token");
    }

})