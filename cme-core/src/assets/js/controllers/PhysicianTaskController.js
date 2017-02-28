var appControllers=angular.module('app.controllers');

appControllers.controller('PhysicianTaskController',function($scope,Storage){

     var physician=Storage.retrieve('id')
     console.log("Retrieving "+physician);

});
