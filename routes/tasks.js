var db=require('../db/db.js');
var request=require('request');

exports.retrieveTasks=function(req,res){
   console.log("Fetching tasks for physician "+req.params.physician);
   var physician_one=false;

   var sql = "SELECT * FROM tasks WHERE ("+
             "(phy_1_id="+req.params.physician+" AND phy_1_coding_icd IS NULL) "+
             " OR (phy_2_id="+req.params.physician+" AND phy_2_coding_icd IS NULL)"+" )"+
              "AND task_status != 'Complete'";
   console.log("Query is "+sql);

   db.query(sql,function(err,result) {
    if (err) {return res.status(500).send(err);}
    else{
      //console.log("All tasks "+JSON.stringify(result));
      return res.status(200).json(result);
    }

    });
}


exports.updateTask=function(req,res){
    console.log("Task Id "+req.params.taskId);
    console.log("Full Update body "+JSON.stringify(req.body));
    var match_result=null;

    //Before update we have to fetch the task from database
    var fetch_sql="SELECT * from tasks where id="+req.params.taskId;

    db.query(fetch_sql,function(err,result) {
     if (err) return res.status(500).send(err);
     else{
       console.log("Task to update is "+JSON.stringify(result));

       if(result[0].phy_1_coding_icd == null && result[0].phy_2_coding_icd == null){
                 updateTaskInDB(req.body,req.params.taskId);
                 return res.status(200).json({"message":"Task is updated successfully"});
       }

       if(result[0].phy_1_coding_icd != null){
             console.log("First physician have already coded");
             //Check whether coding icds are equal or equivalent, If not send for Reconciliation
             if(result[0].phy_1_coding_icd == req.body['phy_2_coding_icd']){
               console.log("Both coding ICDs are equal");
               //update_task_status=" task_status='Complete ,' ";
               req.body['task_status']='Complete'
               updateTaskInDB(req.body,req.params.taskId);
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
                          updateTaskInDB(req.body,req.params.taskId);
                          return res.status(200).json({"message":"Task is updated successfully"});
                     });
                  }
       }

       if(result[0].phy_2_coding_icd != null){
            console.log("Second physician have already coded");
            //Check whether coding icds are equal or equivalent, If not send for Reconciliation

            if(req.body['phy_1_coding_icd'] == result[0].phy_2_coding_icd){
              console.log("Both coding ICDs are equal");
              req.body['task_status']='Complete'
              updateTaskInDB(req.body,req.params.taskId);
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
                        updateTaskInDB(req.body,req.params.taskId);
                        return res.status(200).json({"message":"Task is updated successfully"});
                    });
              }
       }
       //return res.status(200).json(result);
     }
     });
  /*
  */
}

function updateTaskInDB(body,taskId){
  console.log("Update Task "+taskId+" "+JSON.stringify(body))

  var update_columns="";
  for(var key in body){
    console.log("Key: "+key+"  Value: "+body[key]);
    update_columns=update_columns+key+"="+"'"+body[key]+"' , "
  }

  var update_tasks="UPDATE tasks SET "+update_columns+ " WHERE id=?";
  var last_comma=update_tasks.lastIndexOf(',');
  var query_sql=update_tasks.substring(0,last_comma)+" "+update_tasks.substring(last_comma+1)
  console.log("Update SQL "+query_sql)

  db.query(query_sql,[taskId],function (er, results, fields){
        if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
        else{
           console.log("Task updated "+JSON.stringify(results));
           //return res.status(200).json(results);
        }
    })
}
