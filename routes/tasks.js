var db=require('../db/db.js');
var request=require('request');

exports.retrieveTasks=function(req,res){
   console.log("Fetching tasks for physician "+req.params.physician);

   var sql = "SELECT tasks.id,phy_1_id,phy_2_id,record_id,task_status, "+
             "phy_1_coding_icd,phy_1_comments,phy_2_coding_icd,phy_2_comments, "+
             "phy_1_reconciliation_icd,phy_1_reconciliation_comments, "+
             "phy_2_reconciliation_icd,phy_2_reconciliation_comments FROM tasks JOIN va_record ON tasks.record_id=va_record.id "+
             " WHERE (task_status != 'Cancelled') AND ("+
             "(phy_1_id="+req.params.physician+" AND phy_1_coding_icd IS NULL) OR "+
             "(phy_2_id="+req.params.physician+" AND phy_2_coding_icd IS NULL))"+
             "OR ((phy_1_id="+req.params.physician+" AND phy_1_reconciliation_icd IS NULL AND task_status='ReconciliationAssigned')"+
                    "OR (phy_2_id="+req.params.physician+" AND phy_2_reconciliation_icd IS NULL AND task_status='ReconciliationAssigned'))"+
             "OR (adjudicator_id="+req.params.physician+" AND task_status='AdjudicationAssigned')" ;

   console.log("Query is "+sql);

   db.query(sql,function(err,result) {
    if (err) {return res.status(500).send(err);}
    else{
      console.log("All tasks "+JSON.stringify(result));
      return res.status(200).json(result);
    }

    });
}


exports.retrieveTask=function(req,res){
   console.log("Fetching task "+req.params.taskId);
   var sql = "SELECT * from tasks where id="+req.params.taskId;

   console.log("Query is "+sql);

   db.query(sql,function(err,result) {
    if (err) {return res.status(500).send(err);}
    else{
      console.log("Task "+JSON.stringify(result));
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


      if(req.body['task_status']=='Cancelled'){
        updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
        return res.status(200).json({"message":"Task is updated successfully"});
      }


       else if(result[0].task_status == 'CodingAssigned'){

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

       else if(result[0].task_status == 'AdjudicationAssigned'){
          req.body['task_status']='Complete'
          updateTaskAndAssignNewTask(task_phase_name,req.params.taskId,req.body,physician_id,physician_role);
          return res.status(200).json({"message":"Task is updated successfully"});
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

  var phase_physicians=null;
  var adjudicators=[];

  db.query(query_sql,[task_id],function (er, results, fields){
        if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
        else{
           console.log("Task updated "+JSON.stringify(results));
           //Assign New Tasks

           if(physician_role.includes('coder')){

                  if(physician_role.includes('adjudicator')){
                    var fetch_physicians_sql = "SELECT * FROM phase_physician where phase_name='"+phase_name+"'";
                    db.query(fetch_physicians_sql,function(err,physicians) {
                            if (err) return res.status(500).send(err);
                          else{
                               phase_physicians=physicians;
                               phase_physicians.forEach(function(phy){
                                  if(phy.role.includes("adjudicator")){
                                    adjudicators.push(phy)
                                   }
                                 });

                               if(adjudicators.length <= 2){
                                      ;
                                 }
                               else{
                                  assignSingleCodedTask(phase_name,physician_id);
                               }
                           }
                      });
                   }

                   else{
                     assignSingleCodedTask(phase_name,physician_id);
                   }
           }
           else{
               checkForAdjudicationAssignment(phase_name)
            }

       }
  });
}




function assignSingleCodedTask(phase_name,physician_id){

  var coding_pending_tasks_sql=" SELECT * FROM tasks where phase='"+phase_name+"' AND task_status='CodingAssigned' AND phy_2_id IS NULL AND phy_1_id !="+physician_id;
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
                      checkForAdjudicationAssignment(phase_name)
                      // Call adjudication assignment tasks
                    }
                  });
              }
              else{
                //Assign new task for coding
                    assignNewCodingTask(phase_name,physician_id);
              }
          }
        });
}


function assignNewCodingTask(phase_name,physician_id){
  console.log("Assigning new coding task to "+physician_id+" in phase "+phase_name)
  request(
          {uri: "http://localhost:7000/assign_new_coding_task/phase/"+phase_name+"/coder_id/"+physician_id,method: "POST"},
           function(error, response, data) {
             console.log("RESPONSE RESPONSE  "+JSON.stringify(response))
             checkForAdjudicationAssignment(phase_name);
          });
}

function checkForAdjudicationAssignment(phase_name){
   console.log("Checking for assigning adjudication tasks in phase "+phase_name)
   var fetch_adjudication_pending_tasks="SELECT * from tasks WHERE phase='"+phase_name+"' AND task_status='AdjudicationAssignmentPending'";
   var fetch_adjudicators="SELECT * from phase_physician WHERE phase_name='"+phase_name+"' AND role LIKE '%adjudicator%' ";

   var adjudication_tasks=null;
   var adjudicators=null;

   console.log("Query is "+fetch_adjudication_pending_tasks);

     db.query(fetch_adjudication_pending_tasks,function(err,result) {
           if (err) {return res.status(500).send(err);}
           else{ adjudication_tasks=result;
              console.log("Adjudication tasks "+JSON.stringify(adjudication_tasks));

                 if(adjudication_tasks.length != 0){
                     console.log("Fetching Adjudicators")
                     db.query(fetch_adjudicators,function(err,result) {
                          if (err) {return res.status(500).send(err);}
                          else{
                                  adjudicators=result;
                                  console.log("Adjudicators in phase "+phase_name+" "+adjudicators.length);
                                  if(adjudicators.length > 0){
                                      for(var i=0;i<adjudicators.length;i++){
                                        var adjudicator=adjudicators[i];
                                        console.log("Adjudicator "+JSON.stringify(adjudicator));
                                         if(adjudication_tasks[0].phy_1_id != adjudicator.physician_id
                                            && adjudication_tasks[0].phy_2_id != adjudicator.physician_id){

                                              var assign_sql="UPDATE tasks SET adjudicator_id=?, task_status='AdjudicationAssigned' where id=?";
                                              db.query(assign_sql,[adjudicator.physician_id,adjudication_tasks[0].id],function (er, results, fields){
                                                  if (er) return res.status(500).send(er);
                                                  else{
                                                    //return res.status(200).json(results);
                                                    console.log("Adjudication task is assigned to "+adjudicator.physician_id);
                                                  }
                                              });
                                              //break;
                                            }
                                      }
                                  }
                             }
                      });
                 }
              }
       });
}
