// on importe le modèle sauce
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
  // on modifie le format de la requête pour la transformer en objet
  const sauceObject = JSON.parse(req.body.sauce);

  // on supprime l'id renvoyé par le front-end
  delete sauceObject._id;

  // on crée d'une nouvelle instance 'Sauce'
  const sauce = new Sauce({
    // on utilise le racourci spread (...) pour récupérer facilement les informations name, description, ect...
    ...sauceObject,
    // on récupère l'URL dynamique 'image' généré par multer
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  // on engeristre ensuite l'objet dans la database
  sauce
    .save()
    // on fait une promise
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });

  // on affiche les détails ainsi que l'URL de l'image ajoutée
  console.log(sauce);
};

// on renvoie la sauce présente dans la database en fonction de l'ID de la sauce
exports.getOneSauce = (req, res, next) => {
  // on identifie la sauce en question
  Sauce.findOne(
    // on définie avec params le même id que la sauce identifiée
    { _id: req.params.id }
  )
    // on fait une promise
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error: error }));
};

exports.modifySauce = (req, res, next) => {
  // on crée un objet en vérifiant s'il y a une image à modifier
  const sauceObject = req.file
    ? {
        // on récupère les informations des objets
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : {
        // si l'image n'est pas à modifier, on reprend l'objet sans modifier l'image
        ...req.body,
      };

  // on identifie la sauce en question
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // on récupère l'URL de l'image
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne(
          {
            // on insère notre nouvel objet avec le raccourci spread (...)
            _id: req.params.id,
          },
          { ...sauceObject, _id: req.params.id }
        )
          // on fait une promise
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(500).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// pour pouvoir supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  // on identifie la sauce en question avec la méthode findOne()
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    // on récupère l'URL de l'image
    const filename = sauce.imageUrl.split("/images/")[1];
    // on supprime le fichier avec la méthode unlink()
    fs.unlink(`images/${filename}`, () => {
      // on supprime la sauce de la database
      Sauce.deleteOne({ _id: req.params.id })
        // on fait une promise
        .then(() => res.status(200).json({ message: "Sauce supprimée" }))
        .catch((error) => res.status(400).json({ error }));
    });
  });
};

// on renvoie la totalité des sauces présentes dans la database
exports.getAllSauces = (req, res, next) => {
  // on récupère la totalité des sauces avec la méthode find()
  Sauce.find()
    // on fait une promise
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/*=================================================================*/
//PARTIE 2 : gestion des bouttons "like" et "dislike" :
/*=================================================================*/

exports.likeSauceUser = (req, res, next) => {
  // on met une condition pour que seuls les utilisateurs inscrits puissent liker ou disliker une sauce
  if (req.body.userId) {
    switch (req.body.like) {
      // si "like=1" alors effectue une incrémentation de l'attribut "likes" de la sauce et on rajoute l'id de l'utilisateur (userId) dans le tableau usersLiked (voir le model sauce.js)
      case 1:
        // on identifie la sauce en question
        //console.log(req.params);

        Sauce.findOne({ _id: req.params.id })

          .then((sauce) => {
            // on vérifie si l'utilisateur a déjà liké ou disliké
            if (
              sauce.usersLiked.includes(req.body.userId) ||
              sauce.usersDisliked.includes(req.body.userId)
            ) {
              res.status(401).json({
                error: "Vous avez déja liké ou disliké cette sauce...",
              });
            } else {
              console.log("Sauce liké...");
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  $inc: { likes: 1 },
                  $push: { usersLiked: req.body.userId },
                }
              )

                .then(() => res.status(200).json({ message: "Je like" }))
                .catch((error) => res.status(400).json({ error }));
            }
          })
          .catch((error) => res.status(400).json({ error }));

        break;

      //si "like=-1" alors on effectue une incrémentation de l'attribut "dislikes" de la sauce et on rajoute l'id de l'utilisateur (userId) dans le tableau usersDisliked
      case -1:
        // on identifie la sauce en question
        Sauce.findOne({ _id: req.params.id })
          .then((sauce) => {
            //si c'était un like alors :
            if (
              sauce.usersDisliked.includes(req.body.userId) ||
              sauce.usersLiked.includes(req.body.userId)
            ) {
              res.status(401).json({
                error: "Vous avez déja liké ou disliké cette sauce...",
              });
            } else {
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  $inc: { dislikes: 1 },
                  $push: { usersDisliked: req.body.userId },
                }
              )
                .then(() => res.status(200).json({ message: "Je dislike" }))
                .catch((error) => res.status(400).json({ error }));
            }
          })
          .catch((error) => res.status(400).json({ error }));
        break;

      /*si like=0 alors on prend les deux tableaux (usersLiked et usersDisliked) et on effectue une maj des attributs "likes"
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
  }
};
