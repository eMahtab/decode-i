var appControllers=angular.module('app.controllers');

appControllers.controller('CancelTaskController',['CONSTANT','$state','$scope','Storage','$http','taskId',
                            function(CONSTANT,$state,$scope,Storage,$http,taskId){

    /* var physician=Storage.retrieve('id')
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

     $scope.getState=function(state){
       return state.split('Assigned')[0];
     }*/
     $scope.formData={};


     console.log("Cancel task controller executed");

     $scope.cancelTask=function(){
       console.log("Task is cancelled successfully "+taskId);
       var post_body={};
       post_body.cancellation_reason=$scope.formData.cancellation_reason;
       post_body.cancelled_by=Storage.retrieve('id');
       post_body.other_cancellation_reason=$scope.formData.other_cancellation_reason;
       post_body.task_status='Cancelled';


       $http.post(CONSTANT.API_URL+'/physician/'+Storage.retrieve('id')+'/role/'+Storage.retrieve('role')+'/task/'+taskId,
       JSON.stringify(post_body),
           {headers:{"Content-Type":"application/json"}})
      .then(function(re){
        console.log("Last Request"+JSON.stringify(re));
        return re;
      })


     }

}]);
