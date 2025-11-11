import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import ApiResponse from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'



const generateAceessAndRefreshToken= async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken=refreshToken; // here we are saving refreshToken to db
        //   user.save() =>  will validate all the fields of user model when
        //                   this call takes place
        //    user.save({validateBeforeSave:false})=>   will not validate the entire mode
        //              just save without validating the fieldds
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"something went wrong with generating tokens");
    }
}



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


    // console.log("here req.body : =>  " );
    // console.log(req.body);
    // console.log("here req.files  :   => = >");
    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    //  now checking the required avatar field

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is Required");
    }
    // console.log(avatarLocalPath);


    // //  uploading on cloudinary

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.log(avatar);

    //  here we are checking avatar is there or not
    //    because this is required , field so take care these type of fields which are required

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


export const loginUser = asyncHandler(async (req,res)=>{

    //      getting details(email, username, password) from user    req->body
    //      validate the inputs are not empty
    //      check for email and username
    //      username or email based login 
    //      find the user => check for user is already register or not
    //      password check
    //      access and refresh token generate
    //      send tokens with cookies 


    //        getting data from req.body

    const {username, email , password} = req.body;

    //      validating the inputs
    if(
        [username,email,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"username or email or password is Required.");
    }

    //      check for username and email    and username or email both based

    if(!username && !email){
        throw new ApiError(400,"username or email is Required");
    }

    //      find the user

    // const existedUser = User.findOne({email})       both are correct but if we
    // const existedUser = User.findOne({username})      have to use both through
    //                                                      email or username

    const existedUser =await User.findOne({        // this is more efficient
        $or:[{username},{email}]
    })

    if(!existedUser){
        throw new ApiError(404,"User not found , Please Register first");
    }         //  404   -> not found
    

    //      password checking 

    const isPasswordValid = await existedUser.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Credentials.");     // 401 -> unauthorised
    }

    //      at here , user exist and password enter is also correct so then
    //   generating accessToken and refreshToken with method call

    const {accessToken,refreshToken} = await generateAceessAndRefreshToken(existedUser._id);

    const loggedInUser = await User.findById(existedUser._id)
        .select("-password -refreshToken");



    //          creating cookies  
    //          cookies =>  small piece of data send from server to web application 
    //                  along with Session ID etc

    const options={
        httpOnly:true,       //   this will not let js to modify the cookies
        secure:true          //     cookies will send on https request not on http.
    }

    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
               { 
                    user:loggedInUser,accessToken,refreshToken
                },
                " User logged In successfully !!!"
            )
        )


}) 

export const logoutUser = asyncHandler(async (req,res)=>{

    //      for logout user do the followings
    //          firstly we have to find user then 
    //          get accessToken and refreshToken  (  specially accessToken  )
    //          cookies
    //          set refreshToken to empty string in database
    //          and delete all the cookies


    
    //     finding the user from cookies or request header

    const user = await User.findById(req.user._id);

    //      setting refreshToken to empty or undefined in db and saving this

    user.refreshToken=undefined;
    await user.save({validateBeforeSave:false});      //  saving above line change in db

    //    now deleting the cookies 

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponse(200,{},"User logged out  !!!")
        )


})

export const refreshAccessToken = asyncHandler(async (req,res)=>{
    //  finding refresh token from cookies or req.body , this refresh token is of the browser side

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorised Request");
    }
    //  after getting the token , we have to verify this token
    //          by use jwt.verify(token,secretAcceessTokene)

    try {
        const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        //   our refresh token generating fn return the id of user
        //          we can use the id to find the user from db
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"invalid refresh token");
        }
    
        //   at this stage , we have refresh token sent by client, and we have our refresh
        //      token in db , so we have to match whether these refresh tokens are matching 
        //              or not matching
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh Token is expired or used");
        }
    
        //   at here , all done we have matched the tokens, now we have to generate the 
        //      refresh and access tokens and save to db and 
    
        const {accessToken,newRefreshToken}=await generateAceessAndRefreshToken(user?._id);
    
        //  now send these tokens to client via cookie
    
        const options={
            httpOnly:true,       // this will not let javascript to modify the cookies at client side
            secure:true,
        }
    
        res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                ApiResponse(200,
                    {accessToken,refreshToken:newRefreshToken}
                ),
                "Access Token refreshed successfully"
            )   
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }



})

export default registerUser;