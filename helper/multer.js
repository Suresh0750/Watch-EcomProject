const multer = require("multer")
const path = require("path")

const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/categoriedImages')               // which folder we want to store
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)              // file unique name
      cb(null, file.fieldname + '-' + uniqueSuffix+ path.extname(file.originalname))
    }
  })
  
  const upload = multer({
    storage:Storage
  })
  
  module.exports= upload