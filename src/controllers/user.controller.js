import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{

    //   get details from frontend
    //   validation of details  -  not empty
    //   check if user already exit or not  :  username , email
    //   check for images , check avatar because avatar is required field 
    //   upload to cloudinary
    //   create user object - create entry in db
    //   remove password and refresh token from response
    //   check for user creatioin
    //   if yes return response

    
    //         getting details from frontend
    const {username,email, fullname,password} = req.body;
    // console.log("fullname : ",fullname);
    // console.log("email : ",email);
    // console.log("username : ",username);
    // console.log("password : ",password);
    
    //      validation  checks
    if(
        [username,email,fullname,password].some((field) => field?.trim() === ""
        )
    ){
        throw new ApiError(400,"All fields are Required !!! ");
    }

    //           validation of email in proper way

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400,"Email is not Valid");
    }

    //    or we can use validator libarary for validation of email , 
    //          mobileNumber,url and many more




    //      checking user already exists or not

    const existedUser =await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists.");
    }


    // //   now avatar and coverImage


    // console.log("here req.body :  =>" );
    // console.log(req.body);
    // console.log("here req.files  :   => = >");
    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //  now checking the required avatar field

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is Required");
    }
    // console.log(avatarLocalPath);


    // //  uploading on cloudinary

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatar);

    //  here we are checking avatar is there or not
    //    because this required field so take care these type of fields which are required

    if(!avatar){
        throw new ApiError(400,"Avatar is Required not uploaded on cloudinary");
    }


    //    create user object - create entry in db  

    const user=await User.create({
        username:username.toLowerCase(),
        email,
        fullname,
        avatar:avatar.secure_url,
        coverImage:coverImage?.secure_url,
        password,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registerting the user");
    }

    
    //   returning the response that whether the user is registered or not

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

})


export default registerUser;