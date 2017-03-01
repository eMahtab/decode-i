var appControllers=angular.module('app.controllers');

appControllers.controller('TaskController',function(CONSTANT,$scope,Storage,$http,$stateParams,$state){

    console.log("Inside task controller "+$stateParams.vaRecord);
    $scope.currentICD = null;

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

    }

    $scope.clear=function(){
      console.log("Clear")
    }

});
