const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const uploads = multer({ storage });
module.exports = uploads;


// const multer = require("multer");

// // Store files in memory as Buffer
// const storage = multer.memoryStorage();
// const uploads = multer({ storage });

// module.exports = uploads;
