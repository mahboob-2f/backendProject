import multer from "multer";
import crypto from 'crypto'
import path from 'path'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    // fn =crypto.randomBytes(8).toString("hex")+path.extname(file.originalname);
    //     we can do above for creating unique file name  
    //
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })