var appControllers=angular.module('app.controllers',[]);

appControllers.controller('LoginController',function($state,$scope,UserService,AuthTokenFactory,Storage){
    $scope.user={};

    $scope.login=function(email,password){
     $scope.loginError=null;
     var request_body={"email":email,"password":password};
     UserService.login(request_body)
     .then(function(response){
             AuthTokenFactory.setToken(response.data.token);
             Storage.save('username',response.data.username);
             Storage.save('loggedIn',true);
             $state.go('manage');
           },
           function(error){ $scope.loginError="Oops! Invalid email or password";});
   }

});
