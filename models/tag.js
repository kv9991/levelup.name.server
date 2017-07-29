var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({ 
  slug: {
  	type: String,
  	required: true
  }, 
  title: {
  	type: String,
  	required: true
  },
  description: { 
  	type: String,
  	default: null
  }, 
  image: {
  	type: String,
  	default: null
  }, 
  updated: { 
  	type: Date,
  	default: Date.now 
  }
});

tagSchema.index({
  'title': 'text', 
  'description': 'text', 
  'slug': 'text'
});

var Tag = mongoose.model('Tag', tagSchema)
module.exports = Tag
