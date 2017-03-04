var appControllers=angular.module('app.controllers');

appControllers.controller('AllPhaseController',function($scope,$http,CONSTANT,toaster){

      $scope.phases={};

     $scope.fetchAllPhases=function(){
        $http.get(CONSTANT.API_URL+'/phase')
        .then(function(res){
            $scope.phases.list=res.data;
            //console.log("All Phases "+JSON.stringify(res.data));
        });
    }
    $scope.fetchAllPhases();


    $scope.startPhase=function(phase){
      console.log("Start phase called "+JSON.stringify(phase));
      initialize(phase);
    }

  /*  function initialize(phase){
      console.log("Full Phase is "+JSON.stringify(phase));
      var requests=[];
      requests[0]=$http.post(CONSTANT.API_URL+'/phase/'+phase.id+'/initialize',JSON.stringify(phase),
          {headers:{"Content-Type":"application/json"}});

      requests[1]=$http.post(CONSTANT.API_URL+'/phase/'+phase.phase_name+'/initialAssignment',JSON.stringify(phase),
          {headers:{"Content-Type":"application/json"}});

      console.log("Requests "+requests);

       requests[0].then(function(response0) {
                // do something with response0
                toaster.pop('success',"Phase Started");
                $scope.fetchAllPhases();
                return requests[1];
       }).then(function(response1) {
            //do something with response1
            console.log("Client doing INITIAL ASSIGNMENT "+JSON.stringify(response1))

       }).catch(function(failedResponse) {
        console.log("i will be displayed when a request fails (if ever)", failedResponse)
        });
    }*/

    function initialize(phase){
      console.log("Full Phase is "+JSON.stringify(phase));
      /*var requests=[];
      requests[0]=$http.post(CONSTANT.API_URL+'/phase/'+phase.id+'/initialize',JSON.stringify(phase),
          {headers:{"Content-Type":"application/json"}});

      requests[1]=$http.post(CONSTANT.API_URL+'/phase/'+phase.phase_name+'/initialAssignment',JSON.stringify(phase),
          {headers:{"Content-Type":"application/json"}});

      console.log("Requests "+requests);*/
      $http.post(CONSTANT.API_URL+'/phase/'+phase.id+'/initialize',JSON.stringify(phase),
          {headers:{"Content-Type":"application/json"}})
         .then(function(res){
                 toaster.pop('success',"Phase Started");
                 $scope.fetchAllPhases();
                 console.log("Calling Initial Assignment from client");
                 $http.post(CONSTANT.API_URL+'/phase/'+phase.phase_name+'/initialAssignment',JSON.stringify(phase),
                     {headers:{"Content-Type":"application/json"}})
                .then(function(re){
                  console.log("Last Request"+JSON.stringify(re));
                  return re;
                })

              })
              .catch(function(error){
                console.log("Got Error "+error)
              });
    }

});
