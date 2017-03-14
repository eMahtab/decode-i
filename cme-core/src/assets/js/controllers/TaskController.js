var appControllers=angular.module('app.controllers');

appControllers.controller('TaskController',function($uibModal,CONSTANT,$scope,Storage,$http,$stateParams,$state,toaster){

    console.log("State Params "+JSON.stringify($stateParams));
    $scope.currentICD = null;
    $scope.record=null;
    $scope.coding={};
    $scope.taskId=$stateParams.taskId;
    var phy_id=Storage.retrieve('id');

    $scope.comments={'other_physician_coding':"none","other_physician_reconciliation":"none","your_coding":"none","your_reconciliation":"none"};
    $scope.show_other_physicians_coding_comment=false;
    $scope.show_other_physicians_reconciliation_comment=false;
    $scope.show_your_coding_comment=false;
    $scope.show_your_reconciliation_comment=false;

    $http.get(CONSTANT.API_URL+"/vaRecord/"+$stateParams.vaRecord)
    .then(function(res){
        console.log("VaRecord "+JSON.stringify(res.data));
        $scope.record=res.data[0];
        $scope.filepath="assets/cod_images/"+$scope.record.study+"/"+$scope.record.phase+"/"+$scope.record.image_filename;
        console.log("Filepath is "+$scope.filepath)
        $scope.fetchTask();
        $scope.fetchICDs();
    });

    $scope.fetchTask=function(){
      $http.get(CONSTANT.API_URL+"/task/"+$stateParams.taskId)
      .then(function(res){
          console.log("Fetched Task "+JSON.stringify(res.data));
          $scope.task=res.data[0];
          $scope.showComments();
      });
    }

    $scope.fetchICDs=function(){
      $http.get('assets/data/icd.json')
        .then(function(result) {
                   $scope.who_icd=result.data;
                });
    }

    $scope.showComments=function(){

      if($scope.task.task_status == 'ReconciliationAssigned' || $scope.task.task_status == 'AdjudicationAssigned'){
            $scope.show_your_coding_comment=true;

            if(phy_id == $scope.task.phy_1_id){
              console.log("First reconciliation block executed")

              $scope.show_other_physicians_coding_comment=true;
              console.log("Other P Coding Comment "+$scope.task['phy_2_coding_icd']+" - "+$scope.task['phy_2_comments']);
              $scope.comments['other_physician_coding']=$scope.task['phy_2_coding_icd']+" - "+$scope.task['phy_2_comments'];
              $scope.comments['your_coding']=$scope.task['phy_1_coding_icd']+" - "+$scope.task['phy_1_comments'];

              if($scope.task['phy_2_reconciliation_icd'] != null){
              $scope.show_other_physicians_reconciliation_comment=true;
              console.log("Other P Reconciliation Comment "+$scope.task['phy_2_reconciliation_icd']+" - "+$scope.task['phy_2_reconciliation_comments']);
              $scope.comments['other_physician_reconciliation']=$scope.task['phy_2_reconciliation_icd']+" - "+$scope.task['phy_2_reconciliation_comments'];
               }
            }

            else{
              console.log("Second reconciliation block executed")

              $scope.show_other_physicians_coding_comment=true;
              console.log("Other P Coding Comment "+$scope.task['phy_1_coding_icd']+" - "+$scope.task['phy_1_comments']);
              $scope.comments['other_physician_coding']=$scope.task['phy_1_coding_icd']+" - "+$scope.task['phy_1_comments'];
              $scope.comments['your_coding']=$scope.task['phy_2_coding_icd']+" - "+$scope.task['phy_2_comments'];

              if($scope.task['phy_1_reconciliation_icd'] != null){
              $scope.show_other_physicians_reconciliation_comment=true;
              console.log("Other P Reconciliation Comment "+$scope.task['phy_1_reconciliation_icd']+" - "+$scope.task['phy_1_reconciliation_comments']);
              $scope.comments['other_physician_reconciliation']=$scope.task['phy_1_reconciliation_icd']+" - "+$scope.task['phy_1_reconciliation_comments'];
              }

            }
      }
        if($scope.task.task_status == 'AdjudicationAssigned'){
             $scope.show_your_reconciliation_comment=true;

              if(phy_id == $scope.task.phy_1_id){
                $scope.comments['your_reconciliation']=$scope.task['phy_1_reconciliation_icd']+" - "+$scope.task['phy_1_reconciliation_comments'];
              }
              else{
                $scope.comments['your_reconciliation']=$scope.task['phy_2_reconciliation_icd']+" - "+$scope.task['phy_2_reconciliation_comments'];
              }
        }
    }

    $scope.highlight=function(index){
       $scope.currentICD = index;
    }

    $scope.selectICD=function(icd){
      console.log("Selecting ICD "+JSON.stringify(icd));
      $scope.coding.icd=icd.icd+" - "+icd.description;
    }

    $scope.searchICD=function(){
      console.log("Input "+$scope.coding.icd);
    }

    $scope.save=function(){
      console.log("Saving")
      console.log("ID "+phy_id);
      var phy_icd=$scope.coding.icd+"";
      var icd_code=phy_icd.split("-")[0].trim();
      console.log("ICD "+icd_code);
      console.log("Comments "+$scope.coding.comments)

      var post_body={};

      if($scope.task.task_status == 'CodingAssigned'){
        if(phy_id == $scope.task.phy_1_id){
                 post_body['phy_1_coding_icd']=icd_code;
                 post_body['phy_1_comments']=$scope.coding.comments;
        }else{
                 post_body['phy_2_coding_icd']=icd_code;
                 post_body['phy_2_comments']=$scope.coding.comments;
        }
      }

      else if($scope.task.task_status == 'ReconciliationAssigned'){
        if(phy_id == $scope.task.phy_1_id){
                 post_body['phy_1_reconciliation_icd']=icd_code;
                 post_body['phy_1_reconciliation_comments']=$scope.coding.comments;
        }else{
                 post_body['phy_2_reconciliation_icd']=icd_code;
                 post_body['phy_2_reconciliation_comments']=$scope.coding.comments;
        }
      }

      else if($scope.task.task_status == 'AdjudicationAssigned'){
                 post_body['adjudicator_icd']=icd_code;
                 post_body['adjudicator_comments']=$scope.coding.comments;
      }

      $http.post(CONSTANT.API_URL+'/physician/'+phy_id+'/role/'+Storage.retrieve('role')+'/task/'+$stateParams.taskId,JSON.stringify(post_body),
          {headers:{"Content-Type":"application/json"}})
     .then(function(response){
              console.log("Task update response"+JSON.stringify(response));
              toaster.pop('success','Task submitted successfully');
              setTimeout(function(){$state.go('tasks');},2000);
          },
          function(error){
            toaster.pop('error',"Error occurred while submitting the task")
          });
    }

    $scope.clear=function(){
      console.log("Clear")
      $scope.coding.comments="";
    }

    $scope.openCancelTaskModal=function(taskId){
        console.log("Cancelling the task "+taskId)

        var modalInstance = $uibModal.open({
                                          templateUrl: 'assets/templates/cancel-task-modal.html',
                                          backdrop: 'static',
                                          controller: 'CancelTaskController',
                                          resolve:{
                                              taskId:function(){return taskId;}
                                          }
                                          });

        modalInstance.result.then(function(result){

                                    $state.go('tasks');
                                    toaster.pop('success','Task cancelled successfully');
                                    //setTimeout(function(){  },1000);
                                   },
                                   function(reason){
                                    console.log('Reason: ' + JSON.stringify(reason))
                                   });
    }

});
