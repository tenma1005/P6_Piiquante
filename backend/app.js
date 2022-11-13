// on importe le package express
const express = require("express");

// on importe le package mongoose
const mongoose = require("mongoose");

// on importe path afin de définir les différentes routes
const path = require("path");

// pour les variables d'environnement
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

/*pour lire les données HTTP POST, on utilise le module de nœud "body-parser"
body-parser est un middleware express qui lit l'entrée d'un formulaire et la stocke en tant qu'objet javascript accessible via req.body */
const bodyParser = require("body-parser");

/* On utilise un middleware Express qui nettoie les données fournies par l'utilisateur pour empêcher l'injection d'opérateur MongoDB */
const mongoSanitize = require("express-mongo-sanitize");

// helmet aide à sécuriser nos applications Express en définissant divers en-têtes HTTP
const helmet = require("helmet");

//Importation des Router 'Sauces' et 'user'
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// on stocke méthode express() dans une constante
const app = express();

// connexion à la database
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.USER_ADMIN_DB +
      ":" +
      process.env.PWD_ADMIN_DB +
      "@" +
      process.env.DATABASE_NAME +
      ".mongodb.net/?retryWrites=true&w=majority",

    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// on ajoute les headers pour les requêtes (CORS)
app.use((req, res, next) => {
  // on définie ce qui peut accéder à l'API
  res.setHeader("Access-Control-Allow-Origin", "*");
  // on définie quels sont les headers authorisés
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  // on définie quels sont méthodes possibles
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(helmet());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(express.json());

// pour qu'on puisse mettre les requêtes au format JSON
app.use(bodyParser.json());

app.use(mongoSanitize());

// on définie les principales routes
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
