var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var SocketSchema = new Schema({

	user_id: { type: Schema.Types.ObjectId, ref: 'User' },
	socket_id:{type: String },
	to_user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Socket', SocketSchema);