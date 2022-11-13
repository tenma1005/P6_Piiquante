// on importe le package bcrypt pour pouvoir hasher les passwords
const bcrypt = require("bcrypt");

// on importe le package jsonwebtoken pour générer les tokens
const jwt = require("jsonwebtoken");

// on importe le package password-validator
const passwordValidator = require("password-validator");

// on importe le modèle user
const User = require("../models/user");

// on importe le package dotenv pour les variables d'environnement
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
  // on hash le mot de passe avant de l'envoyer dans la database en le salant 10 fois.
  bcrypt
    .hash(req.body.password, 10)
    // on fait une promise
    .then((hash) => {
      // on récupère ensuite le nouveau email et le nouveau password
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // et on sauvegarde les données saisies
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
  // on utilise la méthode findOne() pour trouver l'utilisateur en question
  User.findOne({
    // on récupère l'adresse email de l'utilisateur
    email: req.body.email,
  })
    // on fait un promise
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      // on compare le password saisie avec celui de la database
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // on vérifie si le password est correct ou pas
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            // on renvoi côté front l'userId et le token
            userId: user._id,
            // on encode en utilisant la méthode sign()
            token: jwt.sign(
              { userId: user._id },
              // variable d'environnement qui contient la clé secrète d'encodage :
              process.env.TOKEN_JWT_KEY,
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
