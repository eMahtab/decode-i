var appControllers=angular.module('app.controllers');

appControllers.controller('PhysicianTasksController',function(CONSTANT,$state,$scope,Storage,$http){

     var physician=Storage.retrieve('id')
     $scope.username=Storage.retrieve('username')
     console.log("Retrieving "+physician);

     $http.get(CONSTANT.API_URL+"/tasks/physician/"+physician)
     .then(function(res){
         //$scope.vaRecord.phases=res.data;
         console.log("Number of tasks  "+res.data.length);
         $scope.tasks=res.data;
     });


     $scope.openTask=function(task){
       console.log("Task is "+JSON.stringify(task));
       $state.go('task',{'taskId':task.id,'vaRecord':task.record_id,'task':task})
     }

});
