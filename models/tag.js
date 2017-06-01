var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Tag', new Schema({ 
    slug: String, 
    tagTitle: String,
    tagDescription: String,
    tagImage: String,
    created: {
        type: Date,
        default: Date.now
    }
}));

