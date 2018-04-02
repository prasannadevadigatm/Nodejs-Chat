var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
var app = express();
var SocketIo = require('./app/models/socket');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var cors = require('cors');

mongoose.connect(config.database, function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to the database');
	}
}); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// app.use(morgan('dev'));
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });
app.use(cors());
app.use(express.static(__dirname + '/www'));

var api = require('./app/routes/api')(app, express, io);
app.use('/api', api);


app.get('*', function(req, res) {
	res.sendFile(__dirname + '/www/index.html');
});

http.listen(config.port, function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("Listening on port 3000");
	}
});
io.on('connection', function(socket){
 	socket.on('join', function (data) {
 		console.log(socket.id,'socket',"chat");

	  	console.log('join',data);
	  	
		var socketio = new SocketIo({
			user_id: data.user_id,
			socket_id:data.id,
			to_user_id:data.to_user_id
		});
		socketio.save(function(err, newMsg) {
			if(err) {
				return
			}
			console.log(newMsg);
			
		});
	});
	
  // console.log("connected",socket.id);
});
io.on('disconnect', function () {
console.log("disconnected");
      

  });