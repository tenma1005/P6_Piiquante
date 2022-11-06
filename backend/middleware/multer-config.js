const multer = require("multer");

// on configure les formats d'images qui seront possible d'ajouter
const MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // on modifie le nom de l'image ajoutée par un nouveau nom aléatoire
    const extension = MIME_TYPES[file.mimetype];
    callback(null, Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
