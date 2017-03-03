var appControllers=angular.module('app.controllers');

appControllers.controller('TaskController',function(CONSTANT,$scope,Storage,$http,$stateParams,$state){

    console.log("Inside task controller "+$stateParams.vaRecord);
    console.log("Complete state param "+JSON.stringify($stateParams));
    $scope.currentICD = null;
    $scope.record=null

    $scope.fetchICDs=function(){

      $http.get('assets/data/icd.json')
        .then(function(result) {
                   $scope.who_icd=result.data;
                });
    }

    $scope.highlight=function(index){
       $scope.currentICD = index;
    }

    $scope.selectICD=function(icd){
      console.log("Selecting ICD "+JSON.stringify(icd));
      $scope.coding.icd=icd.icd+" - "+icd.description;
    }

    $http.get(CONSTANT.API_URL+"/vaRecord/"+$stateParams.vaRecord)
    .then(function(res){
        //$scope.vaRecord.phases=res.data;
        console.log("Record "+JSON.stringify(res.data));
        $scope.record=res.data[0];
        $scope.coding={};
        $scope.fetchICDs();
    });

    $scope.searchICD=function(){
      console.log("Input "+$scope.coding.icd);
    }

    $scope.save=function(){
      console.log("Saving")
      console.log("ID "+Storage.retrieve('id'));
      var phy_icd=$scope.coding.icd+"";
      var icd_code=phy_icd.split("-")[0].trim();
      console.log("ICD "+icd_code);
      console.log("Comments "+$scope.coding.comments)

      var post_body={};

      if($stateParams.task.task_status == 'CodingAssigned'){
        if(Storage.retrieve('id') == $stateParams.task.phy_1_id){
                 post_body['phy_1_coding_icd']=icd_code;
                 post_body['phy_1_comments']=$scope.coding.comments;
        }else{
                 post_body['phy_2_coding_icd']=icd_code;
                 post_body['phy_2_comments']=$scope.coding.comments;
        }
      }




      $http.post(CONSTANT.API_URL+'/task/'+$stateParams.task.id,JSON.stringify(post_body),
          {headers:{"Content-Type":"application/json"}})
     .then(function(re){
       console.log("Last Request"+JSON.stringify(re));
       return re;
     })

    }

    $scope.clear=function(){
      console.log("Clear")
    }

});
