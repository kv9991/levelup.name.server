var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moduleSchema = new Schema({ 
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
  header: {
  	type: Boolean, 
  	default: true
  },
  sidebar: { 
  	type: Boolean,
  	default: true
  },
  classNames: { 
    type: String,
    default: ''
  },
  userMustBeLoggedIn: { 
  	type: Boolean, 
  	default: false 
  },
  passLevel: { 
  	type: Number,  default: 0 
  }
});


module.exports = mongoose.model('Module', moduleSchema)


