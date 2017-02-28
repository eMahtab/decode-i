var appControllers=angular.module('app.controllers');

appControllers.controller('TaskController',function(CONSTANT,$scope,Storage,$http,$stateParams,$state){

    console.log("Inside task controller "+$stateParams.vaRecord);
});
