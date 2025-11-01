import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'




const uploadOnCloudinary = async (localFilePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    })
    try {
        // console.log(process.env.CLOUDINARY_API_KEY);
        if (!localFilePath) return null;
        // console.log("local path : ",localFilePath);
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })

        // console.log("file uploaded successfully", response.secure_url);
        //          this is only for testing purpose that whether our files are being 
        //          uploaded on cloudinary or not
        
        fs.unlinkSync(localFilePath);      //  here we are deleting from our local system
        return response;

    } catch (error) {
        console.log("error in cloudinary function", error.message);
        fs.unlinkSync(localFilePath);
        //   this will remove the locally saved temporary file if upload operation
        //          got failed.
    }
}


export { uploadOnCloudinary };
//      then we have to import like
//      import {uploadOnCloudinary} from cloudinary.js like this
//
//    but we can use export default also