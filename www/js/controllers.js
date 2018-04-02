angular.module('starter.controllers', [])

.controller('ChatsCtrl', function($scope, ChatMsg,socketio,$window) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    // ChatMsg.remove(chat);
  };
})

.controller('SignUpController', function($scope, $stateParams, User,socketio,$window) {
  // $scope.chat = Chats.get($stateParams.chatId);
  $scope.user = {};
  $scope.createUser = function(){
    User.create($scope.user)
      .then(function(response) {
        console.log(response);
        // $window.localStorage.setItem('token', response.data.token);
        // $location.path('/');
      })
  }
})
.controller('LoginController', function($scope, $stateParams, Auth,socketio,$window,$state) {
  $scope.user = {};
  $scope.doLogin = function(){
    Auth.login($scope.user.username, $scope.user.password)
      .success(function(data) {
        console.log(data);
        // Auth.getUser()
        //   .then(function(data) {
        //     console.log(data);
        //     // $window.localStorage.setItem('name', data.data.name);
        //     // vm.user = data.data;
        //   });

        // if(data.success)
        //   $location.path('/');
        // else
        //   vm.error = data.message;
        $window.localStorage.setItem('username', data.user.username);
        $window.localStorage.setItem('user_id', data.user._id);
        $state.go('tab.chats');
      });
  }
})
.controller('UserController', function($scope,User, $window) {


  // var vm = this;

  console.log($window.localStorage.getItem('username'));
  User.all({'username':$window.localStorage.getItem('username')})
    .success(function(data) {
      console.log(data);
      $scope.users = data;
    })

    
})
.controller('ChatController', function($scope, ChatMsg,socketio,$window,$stateParams) {

    console.log($stateParams.chatId);
    socketio.emit('join', {'user_id':localStorage.user_id,'to_user_id':$stateParams.chatId});
    // var vm = this;
    $scope.userId = localStorage.user_id;
    $scope.chatData = {};
    ChatMsg.all($stateParams.chatId)
      .success(function(data) {
        console.log(data);
        $scope.chats = data;
      });


    $scope.createMessage = function(){
      $scope.chatData.username = $window.localStorage.getItem('username');
      $scope.chatData.created_to = $stateParams.chatId;
      ChatMsg.create($scope.chatData)
        .success(function(data) {
          console.log(data)
          $scope.chats.push(data.msg);
          $scope.chatData = {};
        });
    }

    socketio.on('chat', function(data) {
      console.log("this is socket",data,$scope.chats);
      $scope.chats.push(data);
      console.log($scope.chats);
    })

})