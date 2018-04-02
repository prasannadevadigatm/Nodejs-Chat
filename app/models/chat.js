var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ChatSchema = new Schema({

	creator: { type: Schema.Types.ObjectId, ref: 'User' },
	content: String,
	created: { type: Date, default: Date.now},
	username: String,
	created_to : { type: Schema.Types.ObjectId }

});

module.exports = mongoose.model('Chat', ChatSchema);