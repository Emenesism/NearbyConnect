import fs from "fs";
import multer = require("multer");
import path from "path";
import { v4 as uuidv4 } from "uuid";

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(path.join(__dirname, "../public/images"))) {
      fs.mkdirSync(path.join(__dirname, "../public"));
    }
    let dest = path.join(__dirname, "../public/images");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.split(".").pop();
    if (
      !["jpg", "jpeg", "png", "svg", "webp"].includes(ext.toLocaleLowerCase())
    ) {
      return new Error("Only jpg, jpeg ,svg ,webp and png files are allowed");
    }
    let fileName = uuidv4() + "." + ext;
    cb(null, fileName);
  },
});


export default storage