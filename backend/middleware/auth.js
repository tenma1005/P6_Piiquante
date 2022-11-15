const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });

module.exports = (req, res, next) => {
  try {
    /*La méthode split() divise une chaîne de caractères en une liste ordonnée de sous-chaînes,
     place ces sous-chaînes dans un tableau et retourne le tableau.
      La division est effectuée en recherchant un motif ; où le motif est fourni comme premier paramètre dans l'appel de la méthode. */

    // ici on utilise la méthode .split() pour ne prendre qu'uniquement la chaine du token (pas le mots bearer)
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.TOKEN_JWT_KEY);

    // on récupére l'userId du token
    const userId = decodedToken.userId;

    if (req.body.userId && req.body.userId !== userId) {
      throw "l'user id n'est pas valible !";
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: new Error("Requête non authentifiée !") });
  }
};
