const multer = require("multer");

// on configure les formats d'image qui seront possibles d'ajouter
const MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// on crée un objet de configuration de multer
const storage = multer.diskStorage({
  // on désigne l'endroit où on va enregistrer les images
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // on modifie le nom de l'image ajoutée par un nouveau nom aléatoire
    const extension = MIME_TYPES[file.mimetype];
    callback(null, Date.now() + "." + extension);
  },
});

// on export ensuite le middleware
module.exports = multer({ storage: storage }).single("image");
