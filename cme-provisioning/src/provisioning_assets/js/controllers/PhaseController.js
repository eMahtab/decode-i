var appControllers=angular.module('app.controllers');

appControllers.controller('PhaseController',function($scope,$http,CONSTANT,toaster,$uibModal){

	$scope.formData={};
    $scope.studies={};
    $scope.seletcedPhysicians={};  
    $scope.formData.physicians=[];

    $scope.fetchStudies=function(){

        $http.get(CONSTANT.API_URL+'/study')
        .then(function(res){
            $scope.studies=res.data;
            console.log("Studies "+JSON.stringify(res.data));
        });
    }
    $scope.fetchStudies(); 

	
    $scope.openPhysicianModal=function(){
        console.log("Manage physicians")

        var modalInstance = $uibModal.open({
                                          templateUrl: 'provisioning_assets/templates/add-physicians-modal.html',                                          
                                          backdrop: 'static'
                                        
                                          });

        modalInstance.result.then(function(result){
                                    $scope.seletcedPhysicians=result
                                   },
                                   function(reason){
                                    console.log('Reason: ' + JSON.stringify(reason))
                                   });  
      
    }

});
