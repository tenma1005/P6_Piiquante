const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const passwordValidator = require("password-validator");

const User = require("../models/User");

const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });

// on fait la configutation de password-validator
const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(8) // le mot de passe doit contenir minimum 8 caractères
  .is()
  .max(20) // le mot de passe doit contenir maximum 20 caractères
  .has()
  .uppercase(1) // le mot de passe doit contenir minimum 1 lettre majuscule
  .has()
  .lowercase(1) // le mot de passe doit contenir minimum 1 lettre minuscule
  .has()
  .digits(1) // le mot de passe doit contenir au moins 1 chiffre
  .has()
  .not()
  .spaces(0); // le mot de passe ne doit pas contenir d'espace

// pour contrôler la création d'utilisateur
exports.signup = (req, res, next) => {
  // on hash le mot de passe avant de l'envoyer dans la database
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "Utilisateur créé avec succès !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// pour contrôler la connexion de l'utilisateur
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_JWT_KEY, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
