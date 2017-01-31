var appControllers=angular.module('app.controllers');

appControllers.controller('ManagePhysicianController',function($scope,$http,CONSTANT,toaster){

	$scope.formData={};
    $scope.search={};
    $scope.selectedPhysicianSearch={};
    $scope.physicians={};
    $scope.physicians.selectedPhysicians=[];

    $scope.retrievePhysician =function(){
        
          $http.get(CONSTANT.API_URL+'/physician')
        .then(function(res){
            $scope.retrievedPhysicians=res.data;
            console.log("Studies "+JSON.stringify(res.data));
        });
    }

	$scope.processForm =function(){
		console.log("Submitting form "+JSON.stringify($scope.formData));
        $http.post(CONSTANT.API_URL+'/physician',JSON.stringify($scope.formData),
        	{headers:{"Content-Type":"application/json"}})
         .then(function(res){
                 toaster.pop('success',"Physician created");
               },
         	   function(err){
                 console.log("Error "+JSON.stringify(err));
         	   });
	}

    $scope.selectPhysician=function(email){
        console.log("Selecting physician "+email)
         if($scope.physicians.selectedPhysicians.indexOf(email) == -1){
            console.log("Added physician");
            $scope.physicians.selectedPhysicians.push(email);
            $scope.physicians.selectedPhysicians.sort();
         }
    }

    $scope.deletePhysician=function(email){
        console.log("Deleting physician "+email)
        var physicianIndex=$scope.physicians.selectedPhysicians.indexOf(email);
         /*if($scope.physicians.selectedPhysicians.indexOf(email) != -1){
            console.log("Delete physician");
            $scope.physicians.selectedPhysicians.push(email);
         }*/
         $scope.physicians.selectedPhysicians.splice(physicianIndex,1);
         $scope.physicians.selectedPhysicians.sort();
    }

});
