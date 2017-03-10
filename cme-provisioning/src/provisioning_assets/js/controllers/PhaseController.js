var appControllers=angular.module('app.controllers');

appControllers.controller('PhaseController',function($scope,$state,$http,CONSTANT,toaster,$uibModal){

	  $scope.formData={};
    $scope.formData.selectedPhysicians=[];

    $scope.studies={};
    $scope.vaRecord={};

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
                                    console.log("Phy "+JSON.stringify(result));
                                    $scope.formData.selectedPhysicians=result
                                   },
                                   function(reason){
                                    console.log('Reason: ' + JSON.stringify(reason))
                                   });
    }


    $scope.fetchVARecordStudies=function(){
        $http.get(CONSTANT.API_URL+'/vaRecord/study/distinct')
        .then(function(res){
            $scope.vaRecord.studies=res.data;
            console.log("Studies "+JSON.stringify(res.data));
        });
    }
    $scope.fetchVARecordStudies();

    $scope.fetchVARecordPhases=function(){
          console.log("Selected study value "+$scope.formData.va_record_study.study)
        $http.get(CONSTANT.API_URL+"/vaRecord/study/distinct/"+$scope.formData.va_record_study.study+"/phase/distinct")
        .then(function(res){
            $scope.vaRecord.phases=res.data;
            console.log("Phases "+JSON.stringify(res.data));
        });
    }

    $scope.processForm =function(){

			//Before submitting form first check whether atleast three physicians are selected, with atleast two coders and atleast one adjudicator
			if($scope.formData.selectedPhysicians.length >=3 ){
				if(checkPhaseCreationPrerequisite($scope.formData.selectedPhysicians)){

					console.log("Submitting form "+JSON.stringify($scope.formData));
					$http.post(CONSTANT.API_URL+'/phase',JSON.stringify($scope.formData),{headers:{"Content-Type":"application/json"}})
					.then(function(res){
									toaster.pop('success',"Phase created");
									$state.go('phases');
								},
							function(err){
									console.log("Error "+JSON.stringify(err));
							});
				}else{
					toaster.pop('error',"At least two coders and one adjudicator must be chosen to start a phase");
				}
			}else{
				  	toaster.pop('error',"At least three physicians must be chosen to start a phase");
			}

     }

});

function checkPhaseCreationPrerequisite(physicians){

				var codersCount=0,adjudicatorsCount=0;
        physicians.forEach(function(physician){
					if(physician.role.includes('coder')){codersCount++;}
					if(physician.role.includes('adjudicator')){adjudicatorsCount++;}
				});
        console.log("CodersCount "+codersCount+" AdjudicatorsCount "+adjudicatorsCount);

				if(codersCount >=2 && adjudicatorsCount >=1){
					console.log("Phase Creation pre conditions are met ")
					return true;
				}else{
						console.log("Phase Creation pre conditions are not met ")
					return false;
				}

}
