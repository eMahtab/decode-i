var appControllers=angular.module('app.controllers');

appControllers.controller('PhysicianController',function($scope,$http,CONSTANT,toaster){

	$scope.formData={};

	$scope.processForm =function(){
		console.log("Submitting form "+JSON.stringify($scope.formData));
        $http.post(CONSTANT.API_URL+'/physician',JSON.stringify($scope.formData),
        	{headers:{"Content-Type":"application/json"}})
         .then(function(res){
                 toaster.pop('success',"Physician created");
               },
         	   function(err){
							 console.log("Error "+JSON.stringify(err));
							 if(err.data.code == 'ER_DUP_ENTRY'){
								  toaster.pop('error',"Error : A physician with this email already exists");
							 }

         	   });
	}

});
