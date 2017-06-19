var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    commentAuthor: {type: String, ref: 'User'},
    commentPost: {type: String, ref: 'Post'},
    commentContent: String,
    commentChilds: Array,
    commentLikes: { type: Number, default: 0 },
    commentDate: { type: Date, default: Date.now }
})


var Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment

