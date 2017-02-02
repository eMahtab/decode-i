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

    $scope.selectPhysician=function(physician){
        console.log("Selecting physician "+JSON.stringify(physician));
        var emails=$scope.physicians.selectedPhysicians.map(function(elem) {return elem.email;});
         if(emails.indexOf(physician.email) == -1){
            console.log("Added physician");
            $scope.physicians.selectedPhysicians.push(physician);            
         }
    }

    $scope.deletePhysician=function(physician){
        console.log("Deleting physician "+JSON.stringify(physician));

        var physicianIndex=$scope.physicians.selectedPhysicians.map(function(elem){return elem.email;})
                           .indexOf(physician.email);
          if(physicianIndex != -1){
            console.log("Deleted physician");
              $scope.physicians.selectedPhysicians.splice(physicianIndex,1);
          }
    }

    $scope.isSelected=function(physician){
        var physicianIndex=$scope.physicians.selectedPhysicians.map(function(elem){return elem.email;})
                           .indexOf(physician.email);
       if(physicianIndex != -1){
           return true;
       }else{
        return false;
       }
    }

    $scope.savePhysicians=function(){
        return $scope.physicians.selectedPhysicians.map(function(elem){return elem.id;})
    }

});
