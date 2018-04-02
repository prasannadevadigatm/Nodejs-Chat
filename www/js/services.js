angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
.factory('ChatMsg', function($http,$window) {


  var chatFactory = {};

  chatFactory.allStories = function() {
    return $http.get('/api/all_stories');
  }

  chatFactory.all = function(id) {
    console.log(id);
    return $http.get('/api/?created_to='+id+'&token='+$window.localStorage.getItem('token'));
  }

  chatFactory.create = function(chatData) {
    console.log(chatData);
    return $http.post('/api/?token='+$window.localStorage.getItem('token'), chatData);
  }


  

  return chatFactory;


})

.factory('socketio', function($rootScope) {

  var socket = io.connect();

  return {

    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },

    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.apply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }

  };

})
.factory('User', function($http) {

  var userFactory = {};

  userFactory.create = function(userData) {
    return $http.post('/api/signup', userData);
  }

  userFactory.all = function(data) {
    return $http.post('/api/users',data);
  }



  return userFactory;

})
.factory('Auth', function($http, $q, AuthToken) {


  var authFactory = {};


  authFactory.login = function(username, password) {

    return $http.post('/api/login', {
      username: username,
      password: password
    })
    .success(function(data) {
      AuthToken.setToken(data.token);
      return data;
    })
  }

  authFactory.logout = function() {
    AuthToken.setToken();
  }

  authFactory.isLoggedIn = function() {
    if(AuthToken.getToken())
        return true;
    else
      return false;
  }

  authFactory.getUser = function() {
    if(AuthToken.getToken())
      return $http.get('/api/me');
    else
      return $q.reject({ message: "User has no token"});

  }


  return authFactory;

})


.factory('AuthToken', function($window) {

  var authTokenFactory = {};

  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  }

  authTokenFactory.setToken = function(token) {

    if(token)
      $window.localStorage.setItem('token', token);
    else
      $window.localStorage.removeItem('token');

  }

  return authTokenFactory;

})

.factory('AuthInterceptor', function($q, $location, AuthToken) {

  var interceptorFactory = {};


  interceptorFactory.request = function(config) {

    var token = AuthToken.getToken();
    console.log(token);

    if(token) {

      config.headers['x-access-token'] = token;

    }

    return config;

  };

  


  return interceptorFactory;
});