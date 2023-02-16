const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true},
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    // like: { type: Number, required: true },
    // dislikes:{ type: Number, required: true },
    // usersLiked:
    // usersDisliked: COMMENTAIRE : il faudra gérer toute la partie like
});

module.exports = mongoose.model('Sauce', sauceSchema);