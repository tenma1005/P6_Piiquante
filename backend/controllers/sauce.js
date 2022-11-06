// on import le modèle Sauce
const Sauce = require("../models/sauce");

/*fs  signifie « file system » (soit « système de fichiers », en français).
 Il nous donne accès aux fonctions qui nous permettent de modifier le système de fichiers,
  y compris aux fonctions permettant de supprimer les fichiers*/
const fs = require("fs");

/*=================================================================*/
//PARTIE 1 : Gestion des sauces (ajout, supression, maj, ect...) :
/*=================================================================*/

// pour que l'utilisateur puisse créer une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });

  // on affiche les détails ainsi que l'url de l'image ajouté
  console.log(sauce);
};

// on renvoi la sauce présente dans la base de donnée en fonction de l'ID de la sauce
exports.getOneSauce = (req, res, next) => {
  // on identifie la sauce en question
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error: error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  // on identifie la sauce en question
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // on récupère l'URL de l'image
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(500).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// pour pouvoir supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  // on identifie la sauce en question
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    // on récupère l'URL de l'image
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      // on supprime la sauce de la database
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Sauce supprimée" }))
        .catch((error) => res.status(400).json({ error }));
    });
  });
};

// on renvoi la totalité les sauces présente dans la database
exports.getAllSauces = (req, res, next) => {
  // on récupère la totalité des sauces
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/*=================================================================*/
//PARTIE 2 : gestion des bouttons "like" et "dislike" :
/*=================================================================*/

exports.likeSauceUser = (req, res, next) => {
  switch (req.body.like) {
    // si "like=1" alors effectue une incrémentation de l'attribut "likes" de la sauce et on rajoute l'id de l'utilisateur (userId) dans le tableau usersLiked (voir le model sauce.js)
    case 1:
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
      )
        .then(() => res.status(200).json({ message: "Je like" }))
        .catch((error) => res.status(400).json({ error }));
      break;

    //si "like=-1" alors on effectue une incrémentation de l'attribut "dislikes" de la sauce et on rajoute l'id de l'utilisateur (userId) dans le tableau usersDisliked
    case -1:
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
      )
        .then(() => res.status(200).json({ message: "Je dislike" }))
        .catch((error) => res.status(400).json({ error }));
      break;

    /*si like=0 alors on prends les deux tableaux (usersLiked et usersDisliked) et on effectue une maj des attributs "likes"
    et "dislikes" ainsi que des tableaux en fonction de l'userId dans l'un des deux */
    case 0:
      // on identifie la sauce en question
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          //si c'était un like alors :
          if (sauce.usersLiked.includes(req.body.userId)) {
            // on effectue alors une décrémentation de l'attribut "likes" de la sauce en question et on supprime l'utilisateur en question du tableau "usersLiked"
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
            )
              .then(() =>
                res.status(200).json({ message: "Je ne like plus !" })
              )
              .catch((error) => res.status(400).json({ error }));

            //sinon si c'était un dislike alors :
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            // on effectue alors une décrémentation de l'attribut "dislikes" de la sauce en question et on supprime l'utilisateur en question du tableau "usersDisliked"
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() =>
                res.status(200).json({ message: "Je ne dislike plus !" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
      break;
  }
};
