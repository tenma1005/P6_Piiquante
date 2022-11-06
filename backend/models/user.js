const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// on crée un schéma de la datebase des utilisateur avec la méthode .Schema() de Mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// plugin de validation d'une adresse mail "unique"
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
