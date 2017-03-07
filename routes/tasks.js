var db=require('../db/db.js');
var request=require('request');

exports.retrieveTasks=function(req,res){
   console.log("Fetching tasks for physician "+req.params.physician);
   var physician_one=false;

   var sql = "SELECT * FROM tasks WHERE ("+
             "(phy_1_id="+req.params.physician+" AND phy_1_coding_icd IS NULL) "+
             " OR (phy_2_id="+req.params.physician+" AND phy_2_coding_icd IS NULL))"+
             " OR ((phy_1_id="+req.params.physician+" AND phy_1_reconciliation_icd IS NULL AND task_status='ReconciliationAssigned')"+
                    "OR (phy_2_id="+req.params.physician+" AND phy_2_reconciliation_icd IS NULL AND task_status='ReconciliationAssigned'))";

              //"AND task_status != 'Complete'";
   console.log("Query is "+sql);

   db.query(sql,function(err,result) {
    if (err) {return res.status(500).send(err);}
    else{
      //console.log("All tasks "+JSON.stringify(result));
      return res.status(200).json(result);
    }

    });
}

exports.assignNewCoding=function(req,res){
      console.log("Got new task assignment FOR phase "+req.params.phase_name+" and physician "+req.params.id);
      // Select * from tasks where phase= AND task_status='Initialized'

      var fetch_initialized_tasks = "SELECT * FROM tasks WHERE phase='"+req.params.phase_name+"' AND task_status='Initialized'";
      console.log("Query is "+fetch_initialized_tasks);

      db.query(fetch_initialized_tasks,function(err,result) {
          if (err) {return res.status(500).send(err);}
          else{
            console.log("Initialized tasks "+JSON.stringify(result[0]));
             if(result.length != 0){
                   var update_task_sql="UPDATE tasks SET phy_1_id="+req.params.id+" , task_status='CodingAssigned' WHERE id=?";
                   db.query(update_task_sql,[result[0].id],function (er, results, fields){
                       if (er) return res.status(500).send(er);
                       else{
                         return res.status(200).json(results);
                       }
                   })
                 }
             }
      });

}



exports.updateTask=function(req,res){
    console.log("Task Id "+req.params.taskId);
    console.log("Full Update body "+JSON.stringify(req.body));
    var task_phase_name="";
    var physician_id=req.params.physician_id;
    var physician_role=req.params.physician_role;
    var match_result=null;


    //Before update we have to fetch the task from database
    var fetch_sql="SELECT * from tasks where id="+req.params.taskId;

    db.query(fetch_sql,function(err,result) {
     if (err) return res.status(500).send(err);
     else{
       console.log("Task to update is "+JSON.stringify(result));
       task_phase_name=result[0].phase;
       console.log("Updating in "+task_phase_name+" by "+physician_id+" with role "+physician_role)
       if(result[0].task_status == 'CodingAssigned'){

       if(result[0].phy_1_coding_icd == null && result[0].phy_2_coding_icd == null){
                 updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                 return res.status(200).json({"message":"Task is updated successfully"});
       }

       else if(result[0].phy_1_coding_icd != null){
             console.log("First physician have already coded");
             //Check whether coding icds are equal or equivalent, If not send for Reconciliation
             if(result[0].phy_1_coding_icd == req.body['phy_2_coding_icd']){
               console.log("Both coding ICDs are equal");
               //update_task_status=" task_status='Complete ,' ";
               req.body['task_status']='Complete'
               updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
               return res.status(200).json({"message":"Task is updated successfully"});
             }
             else{
             request(
                     {uri: "http://localhost:7000/icdEquivalence/match?icd1="+result[0].phy_1_coding_icd+"&icd2="+req.body['phy_2_coding_icd'],method: "GET"},
                      function(error, response, data) {
                         match_result=JSON.parse(data);
                         console.log("Got Result "+JSON.stringify(match_result))
                         if(match_result.length != 0){
                           console.log("1. Both coding ICDs are equivalent "+match_result.length);
                           req.body['task_status']='Complete'
                         }else{
                           console.log("Both coding ICDs are not equivalent");
                           req.body['task_status']='ReconciliationAssigned'
                         }
                          updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                          return res.status(200).json({"message":"Task is updated successfully"});
                     });
                  }
       }

      else if(result[0].phy_2_coding_icd != null){
            console.log("Second physician have already coded");
            //Check whether coding icds are equal or equivalent, If not send for Reconciliation

            if(req.body['phy_1_coding_icd'] == result[0].phy_2_coding_icd){
              console.log("Both coding ICDs are equal");
              req.body['task_status']='Complete'
              updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
              return res.status(200).json({"message":"Task is updated successfully"});
            }
            else{
            request(
                    {uri: "http://localhost:7000/icdEquivalence/match?icd1="+req.body['phy_1_coding_icd']+"&icd2="+result[0].phy_2_coding_icd,method: "GET"},
                     function(error, response, data) {
                        match_result=JSON.parse(data);
                        console.log("Got Result "+JSON.stringify(match_result))
                        if(match_result.length != 0){
                          console.log("2. Both coding ICDs are equivalent "+match_result.length);
                          req.body['task_status']='Complete'
                        }else{
                          console.log("Both coding ICDs are not equivalent");
                          req.body['task_status']='ReconciliationAssigned'
                        }
                        updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                        return res.status(200).json({"message":"Task is updated successfully"});
                    });
              }
       }

     }

       else if(result[0].task_status == 'ReconciliationAssigned'){
         console.log("Doing Reconciliation task update")

         if(result[0].phy_1_reconciliation_icd == null && result[0].phy_2_reconciliation_icd == null){
                  updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                   return res.status(200).json({"message":"Task is updated successfully"});
         }

         else if(result[0].phy_1_reconciliation_icd != null){
               console.log("First physician have already reconciled");
               //Check whether coding icds are equal or equivalent, If not send for Reconciliation
               if(result[0].phy_1_reconciliation_icd == req.body['phy_2_reconciliation_icd']){
                 console.log("Both reconciliation ICDs are equal");
                 //update_task_status=" task_status='Complete ,' ";
                 req.body['task_status']='Complete'
                 updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                 return res.status(200).json({"message":"Task is updated successfully"});
               }
               else{
               request(
                       {uri: "http://localhost:7000/icdEquivalence/match?icd1="+result[0].phy_1_reconciliation_icd+"&icd2="+req.body['phy_2_reconciliation_icd'],method: "GET"},
                        function(error, response, data) {
                           match_result=JSON.parse(data);
                           console.log("Got Result "+JSON.stringify(match_result))
                           if(match_result.length != 0){
                             console.log("1. Both Reconciliation ICDs are equivalent "+match_result.length);
                             req.body['task_status']='Complete'
                           }else{
                             console.log("Both Reconciliation ICDs are not equivalent");
                             req.body['task_status']='AdjudicationAssignmentPending'
                           }
                            updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                            return res.status(200).json({"message":"Task is updated successfully"});
                       });
                    }
         }

         else if(result[0].phy_2_reconciliation_icd != null){
               console.log("Second physician have already reconciled");
               //Check whether coding icds are equal or equivalent, If not send for Reconciliation

               if(req.body['phy_1_reconciliation_icd'] == result[0].phy_2_reconciliation_icd){
                 console.log("Both Reconciliation ICDs are equal");
                 req.body['task_status']='Complete'
                 updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                 return res.status(200).json({"message":"Task is updated successfully"});
               }
               else{
               request(
                       {uri: "http://localhost:7000/icdEquivalence/match?icd1="+req.body['phy_1_reconciliation_icd']+"&icd2="+result[0].phy_2_reconciliation_icd,method: "GET"},
                        function(error, response, data) {
                           match_result=JSON.parse(data);
                           console.log("Got Result "+JSON.stringify(match_result))
                           if(match_result.length != 0){
                             console.log("2. Both Reconciliation ICDs are equivalent "+match_result.length);
                             req.body['task_status']='Complete'
                           }else{
                             console.log("Both Reconciliation ICDs are not equivalent");
                             req.body['task_status']='AdjudicationAssignmentPending'
                           }
                           updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
                           return res.status(200).json({"message":"Task is updated successfully"});
                       });
                 }
          }

       }
       //return res.status(200).json(result);
     }
     });
  /*
  */
}

function updateTaskAndAssignNewTask(phase_name,task_id,update_body,physician_id,physician_role){
  console.log("Update Task "+task_id+" "+JSON.stringify(update_body))

  var update_columns="";
  for(var key in update_body){
    console.log("Key: "+key+"  Value: "+update_body[key]);
    update_columns=update_columns+key+"="+"'"+update_body[key]+"' , "
  }

  var update_tasks="UPDATE tasks SET "+update_columns+ " WHERE id=?";
  var last_comma=update_tasks.lastIndexOf(',');
  var query_sql=update_tasks.substring(0,last_comma)+" "+update_tasks.substring(last_comma+1)
  console.log("Update SQL "+query_sql)

  db.query(query_sql,[task_id],function (er, results, fields){
        if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
        else{
           console.log("Task updated "+JSON.stringify(results));
           //Assign New Task

           //if(update_body.task_status == 'CodingAssigned' || update_body.task_status == 'AdjudicationAssignmentPending' || update_body.task_status == 'Complete' || update_body.task_status == 'ReconciliationAssigned'){
            if(true){
                console.log("Trying to assign new task");

                if(physician_role.toLowerCase().includes("coder")){
                  //check If there are single coding assignment tasks
                    var coding_pending_tasks_sql=" SELECT * FROM tasks where task_status='CodingAssigned' AND phy_2_id IS NULL AND phy_1_id !="+physician_id;
                    db.query(coding_pending_tasks_sql,function(err,result) {
                           if (err) {return res.status(500).send(err);}
                           else{
                             console.log(" *****  Single coding Tasks "+JSON.stringify(result));
                             if(result.length != 0){
                                console.log("Assigning single coding task to physician "+physician_id);
                                var update_coding_task="UPDATE tasks SET phy_2_id="+physician_id+" WHERE id=?";
                                db.query(update_coding_task,[result[0].id],function (er, new_task, fields){
                                      if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
                                      else{
                                        console.log("NEW TASK ASSIGNMENT "+JSON.stringify(new_task))
                                        console.log("New task is assigned successfully");
                                        // Call adjudication assignment tasks
                                      }
                                    });
                                }
                                else{
                                  //Assign new task for coding
                                      assignNewCodingTask(phase_name,physician_id);
                                          //checkForAdjudicationAssignment();
                                        //SELECT * from tasks JOIN physicians on where tasks.task_status='AdjudicationAssignmentPending'
                                        //Select * from phase_physician where phase_name='koramangala' and role like '%adjudicator%
                                        //Select * from tasks where task_status != 'Complete' group by
                                }
                            }
                          });
                   }

                   else{
                     //fetch all adjudicators
                   }



           }
        }
    })
}


function assignNewCodingTask(phase_name,physician_id){
  console.log("Assigning new coding task to "+physician_id+" in phase "+phase_name)
  request(
          {uri: "http://localhost:7000/assign_new_coding_task/phase/"+phase_name+"/coder_id/"+physician_id,method: "POST"},
           function(error, response, data) {
             console.log("RESPONSE RESPONSE  "+JSON.stringify(response))
          });

}

function checkForAdjudicationAssignment(){


}
