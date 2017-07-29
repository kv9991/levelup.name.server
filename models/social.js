var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var socialSchema = new Schema({ 
  link: {
  	type: String,
  	required: true
  },
  title: { 
  	type: String,
  	required: true
  }, 
  owner: {
  	type: Schema.Types.ObjectId,
  	required: true,
    ref: 'User' 
  }, 
  updated: { 
  	type: Date,
  	default: Date.now 
  }
});

var Social = mongoose.model('Social', socialSchema)
module.exports = Social
