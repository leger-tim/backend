const Sauce = require('../models/Sauce');
const fs = require('fs');
const dotenv = require("dotenv");
dotenv.config();

exports.getAllSauce = (req, res, next) => {
  // Utilise la méthode find() pour récupérer toutes les sauces dans la base de données
    Sauce.find().then(
      (sauces) => {
        res.status(200).json(sauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  exports.getOneSauce = (req, res, next) => {
    // Utilise la méthode findOne() pour trouver la sauce correspondant à l'id de la requête
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
    .catch(error => { res.status(400).json( { error })})
 };


  
  exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé'});
            } else {
              const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                .catch(error => res.status(401).json({ error }));
            });
          }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };
  
  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };
  
 exports.likeDislikeSauce = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // On récupère l'objet Sauce correspondant à l'id fourni dans la requête
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // On stocke l'ID de l'utilisateur et son choix de vote (like, dislike,0)
      const userId = req.body.userId;
      const like = req.body.like;

      // Si l'utilisateur aime la sauce
      if (like === 1) {
        // Si l'utilisateur n'a pas déjà liké la sauce, on ajoute son ID dans le tableau "usersLiked" et on incrémente les likes
        if (!sauce.usersLiked.includes(userId)) {
          sauce.usersLiked.push(userId);
          sauce.likes++;
        }
      // Si l'utilisateur n'aime pas la sauce
      } else if (like === -1) {
        // Si l'utilisateur n'a pas déjà disliké la sauce, on ajoute son ID dans le tableau "usersDisliked" et on incrémente les dislikes
        if (!sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked.push(userId);
          sauce.dislikes++;
        }
      // Si l'utilisateur annule son vote
      } else {
        // Si l'utilisateur a liké la sauce, on enlève son ID du tableau "usersLiked" et on décrémente les likes
        if (sauce.usersLiked.includes(userId)) {
          sauce.usersLiked.pull(userId);
          sauce.likes--;
        // Si l'utilisateur a disliké la sauce, on enlève son ID du tableau "usersDisliked" et on décrémente les dislikes
        } else if (sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked.pull(userId);
          sauce.dislikes--;
        }
      }

      // On enregistre les modifications de l'objet Sauce dans la base de données
      sauce.save()
        .then(() => res.status(200).json({ message: 'Like/Dislike enregistré !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
};







