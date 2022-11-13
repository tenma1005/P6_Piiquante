const express = require("express");

/* La méthode express.Router() va nous permettre de créer des routeurs séparés pour chaque route
  principale de notre application – on y enregistre ensuite les routes individuelles */
const router = express.Router();

// on importe le middleware qui va nous permettre d'authentifier les pages de l'application
const auth = require("../middleware/auth");

// on importe le middleware qui va définir le nom et la destination des fichiers images
const multer = require("../middleware/multer-config");

// on importe le fichier de contrôleur des sauces qu'on a exporté et on les attributes aux routes correspondantes pour améliorer la maintenabilité de l'application
const sauceCtrl = require("../controllers/sauce");

// On définie toutes les routes :
// route pour afficher toutes les sauces
router.get("/", auth, sauceCtrl.getAllSauces);

// route pour créer une sauce
router.post("/", auth, multer, sauceCtrl.createSauce);

// route pour afficher une sauce en fonction de son id
router.get("/:id", auth, sauceCtrl.getOneSauce);

// route pour modifier une sauce
router.put("/:id", auth, multer, sauceCtrl.modifySauce);

// route pour supprimer une sauce
router.delete("/:id", auth, sauceCtrl.deleteSauce);

// route pour les likes et dislikes
router.post("/:id/like", auth, sauceCtrl.likeSauceUser);

// on export les routes
module.exports = router;
