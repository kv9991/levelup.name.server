var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Comment', new Schema({
    commentAuthor: String,
    commentPost: String,
    commentContent: String,
    commentChilds: Array,
    commentLikes: { type: Number, default: 0 },
    commentDate: { type: Date, default: Date.now }
}));
