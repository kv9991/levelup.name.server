var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  author: {
  	type: Schema.Types.ObjectId, 
  	ref: 'User',
  	required: true
  },
  content: {
  	type: String,
  	required: true
  },
  children: [{
  	type: Schema.Types.ObjectId, 
  	ref: 'Comment',
  	default: []
  }],
  likes: { 
  	type: Schema.Types.ObjectId,
  	ref: 'User',
  	default: []
  },
  updated: {
  	type: Date,
  	default: Date.now,
  	required: true
  }
})

var Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment

