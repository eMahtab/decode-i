var appControllers=angular.module('app.controllers');

appControllers.controller('StudyController',function($scope,$http,CONSTANT,toaster){

	$scope.formData={};

	$scope.processForm =function(){
		console.log("Submitting form "+JSON.stringify($scope.formData));
        $http.post(CONSTANT.API_URL+'/study',JSON.stringify($scope.formData),
        	{headers:{"Content-Type":"application/json"}})
         .then(function(res){
                 toaster.pop('success',"Study created");
               },
         	   function(err){
                 console.log("Error "+err);
         	   });
	}

});
