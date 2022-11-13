// on importe du package mongoose
const mongoose = require("mongoose");

// on importe le package mongoose-unique-validator
const uniqueValidator = require("mongoose-unique-validator");

// on crée un schéma de la database des utilisateurs avec la méthode .Schema() de Mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// plugin de validation d'une adresse mail "unique"
userSchema.plugin(uniqueValidator);

// on export ensuite le schema User
module.exports = mongoose.model("User", userSchema);
