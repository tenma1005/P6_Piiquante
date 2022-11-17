// on importe le package http de node
const http = require("http");

// on importe le fichier app.js
const app = require("./app");

// on importe le package dotenv pour les variables d'environnement
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

// on renvoie un port valide, soit sous forme d'un numéro ou d'une chaîne
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// on définie le port 3000
// avec la variable d'environnement PORT on peut choisir le port (comme 4444 par exemple)
const port = normalizePort(process.env.PORT || "3000");
// on définie le port pour app.js
app.set("port", port);

// pour la gestion des différentes erreurs avec 'errorHandler'
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// on crée le serveur
const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

// lancement réussi \O/
server.listen(port);
