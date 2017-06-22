var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moduleSchema = new Schema({ 
    slug: {type: String}, 
    moduleTitle: {type: String},
    moduleClassName: String,
    moduleDescription: {type: String},
    moduleShowTitle: Boolean,
    moduleShowHeader: Boolean,
    moduleShowSidebar: Boolean,
    userMustBeLoggedIn: { type: Boolean, default: false },
    passLevel: { type: Number,  default: 0 }
});

moduleSchema.index({'moduleTitle': 'text', 'slug': 'text'});
module.exports = mongoose.model('Module', moduleSchema)


