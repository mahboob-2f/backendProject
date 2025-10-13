
import mongoose, { Schema } from "mongoose";

const videoSchema  = new Schema(
    {
        videoFile:{
            type:String,     //  cloudnary url
            required:true,
        },
        thumbnail:{
            type:String,      // cloundnary url
            required:true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number,
        },
        views:{
            type:Number,
            default:0,
        },
        isPublished:{
            type:Boolean,
            default:true,
        }

    }
    ,{timestamps:true});


export const Video  = mongoose.model("Video",videoSchema);