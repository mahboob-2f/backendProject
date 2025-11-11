import mongoose ,{Schema} from "mongoose";
//  in this line we are importing , tools that are needed to create 
//      collection and documents of what type will be inserted in collection 


const subscriptionSchema = new Schema({},{timestamps:true})
//   this line define the table structures, or how each document in collection will look
//          and adding two fields of timestamps in documents automatically 
//      or in simple words, this line of code will tell how each documents will look like  


export const Subscription = mongoose.model("Subscription",subscriptionSchema);
//        this line of code will create or connect the collection named subscriptions to db and
//          will inserted that documents which follows the document structure or subscriptionSchema