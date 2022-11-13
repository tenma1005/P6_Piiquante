const express = require("express");
const router = express.Router();

// on utilise express-rate-limit pour éviter un crash du serveur
const rateLimit = require("express-rate-limit");

const userCtrl = require("../controllers/user");

const passLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // temps d'attente : 10 minutes
  max: 5, // le nombre d'essais max par adresse id
});

// on crée les différentes routes de l'api en leur précisant le bon ordre des middlewares (c-a-d pas "/login" avant "/signup")
router.post("/signup", userCtrl.signup);
router.post("/login", passLimiter, userCtrl.login);

// on export les routes
module.exports = router;
