const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const uploads = multer({ storage });
module.exports = uploads;


