var appControllers=angular.module('app.controllers');

appControllers.controller('PhysicianTasksController',function(CONSTANT,$scope,Storage,$http){

     var physician=Storage.retrieve('id')
     console.log("Retrieving "+physician);

     $http.get(CONSTANT.API_URL+"/tasks/physician/"+physician)
     .then(function(res){
         //$scope.vaRecord.phases=res.data;
         console.log("Number of tasks  "+res.data.length);
         $scope.tasks=res.data;
     });

});
