var appControllers=angular.module('app.controllers');

appControllers.controller('AllPhaseController',function($scope,$http,CONSTANT,toaster){

      $scope.phases={};

     $scope.fetchAllPhases=function(){
        $http.get(CONSTANT.API_URL+'/phase')
        .then(function(res){
            $scope.phases.list=res.data;
            console.log("All Phases "+JSON.stringify(res.data));
        });
    }
    $scope.fetchAllPhases();


    $scope.startPhase=function(phase){
      console.log("Start phase called "+JSON.stringify(phase));
      initialize(phase);
    }


    function initialize(phase){
      $http.post(CONSTANT.API_URL+'/phase/'+phase.id+'/initialize',JSON.stringify(phase),
          {headers:{"Content-Type":"application/json"}})
         .then(function(res){
                 toaster.pop('success',"Phase Started");
                 $scope.fetchAllPhases();
               },
             function(err){
                 console.log("Error "+JSON.stringify(err));
             });
    }
	    
});
