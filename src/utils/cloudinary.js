import {v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    secure:true,
})

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto',
        })
        console.log("file uploaded successfully",response.url);
        return response;

    }catch(error){
        fs.unlinkSync(localFilePath);
        //   this will remove the locally saved temporary file if upload operation
        //          got failed.
    }
}


export {uploadOnCloudinary};
//      then we have to import like
//      import {uploadOnCloudinary} from cloudinary.js like this
//  
//    but we can use export default also