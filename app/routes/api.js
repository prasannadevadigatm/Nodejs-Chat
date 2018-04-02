var User = require('../models/user');
var Chat = require('../models/chat');
var SocketIo = require('../models/socket');
var encryptor = require('simple-encryptor')('key dgsg dsfdsf dfsdf dfsfdsf');
var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');


function createToken(user) {

	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
	});


	return token;

}

module.exports = function(app, express, io) {


	var api = express.Router();


	api.get('/all_stories', function(req, res) {
		
		Chat.find({}, function(err, stories) {
			if(err) {
				res.send(err);
				return;
			}
			res.json(stories);
		});
	});

	api.post('/signup', function(req, res) {

		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});
		var token = createToken(user);
		console.log(req);
		user.save(function(err) {
			if(err) {
				res.send(err);
				return;
			}

			res.json({ 
				success: true,
				message: 'User has been created!',
				token: token
			});
		});
	});


	api.post('/users', function(req, res) {
		console.log(req.body.usernamey);

		User.find({ username: { $ne: req.body.username } }, function(err, users) {
			if(err) {
				res.send(err);
				return;
			}

			res.json(users);

		});
	});
	
	api.post('/login', function(req, res) {

		User.findOne({ 
			username: req.body.username
		}).select('name username password').exec(function(err, user) {

			if(err) throw err;

			if(!user) {

				res.send({ message: "User doenst exist"});
			} else if(user){ 

				var validPassword = user.comparePassword(req.body.password);

				if(!validPassword) {
					res.send({ message: "Invalid Password"});
				} else {

					///// token
					var token = createToken(user);

					res.json({
						success: true,
						message: "Successfuly login!",
						token: token,
						user:user
					});
				}
			}
		});
	});

	api.use(function(req, res, next) {


		console.log("Somebody just came to our app!");

		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		// check if token exist
		if(token) {

			jsonwebtoken.verify(token, secretKey, function(err, decoded) {

				if(err) {
					res.status(403).send({ success: false, message: "Failed to authenticate user"});

				} else {

					//
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.status(403).send({ success: false, message: "No Token Provided"});
		}

	});

	

	// Destination B // provide a legitimate token

	api.route('/')

		.post(function(req, res) {
			var encrypted = encryptor.encrypt(req.body.content);
			var chat = new Chat({
				creator: req.decoded.id,
				content: encrypted,
				username: req.body.username,
				created_to : req.body.created_to
			});

			chat.save(function(err, newMsg) {
				if(err) {
					res.send(err);
					return
				}
				SocketIo.findOne({$and : [ { user_id:req.body.created_to}, { to_user_id : req.decoded.id } ] }, function(err, userSocket) {
					if(err) {
						return;
					}
					console.log(userSocket,'164');
					var socketMsg = newMsg;
					socketMsg.content = encryptor.decrypt(socketMsg.content);
					io.to(userSocket.socket_id).emit('chat',socketMsg);
					res.json({message: "Message Send Successfully!",msg:newMsg});
				});


				// io.to('57970509832a6097150e902e').emit('chat', newMsg)
				// io.to(req.body.created_to).emit('chat',newMsg);

				
			});
		})


		.get(function(req, res) {
			Chat.find({ 
			    $or : [
			        { $and : [ { creator: req.decoded.id }, { created_to : req.param('created_to') } ] },
			        { $and : [ { creator: req.param('created_to') }, { created_to : req.decoded.id } ] }
			    ]
			}, function(err, messages) {

				if(err) {
					res.send(err);
					return;
				}
				for (var i = 0;i < messages.length;i++) {
					messages[i].content = encryptor.decrypt(messages[i].content);
				}
				res.send(messages);
			});
		});
		
	
	api.get('/me', function(req, res) {
		res.send(req.decoded);
	});




	return api;


}