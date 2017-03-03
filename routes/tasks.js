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
    var update="";
    for(var key in req.body){
      console.log("Key: "+key+"  Value: "+req.body[key]);
      update=update+key+"="+"'"+req.body[key]+"' , "
    }

    var update_tasks="UPDATE tasks SET "+ update + " WHERE id=?";
    var last_comma=update_tasks.lastIndexOf(',');
    var query_sql=update_tasks.substring(0,last_comma)+" "+update_tasks.substring(last_comma+1)
    console.log("Update SQL "+query_sql)

    //Before update we have to fetch the task from database
    var fetch_sql="SELECT * from tasks where id="+req.params.taskId;

    db.query(fetch_sql,function(err,result) {
     if (err) return res.status(500).send(err);
     else{
       console.log("Task to update is "+JSON.stringify(result));

       if(result[0].phy_1_coding_icd != null){
             console.log("First physician have already coded");
             //Check whether coding icds are equal or equivalent, If not send for Reconciliation

             request(
                     {uri: "http://localhost:7000/icdEquivalence/match?icd1="+result[0].phy_1_coding_icd+"&icd2="+req.body['phy_2_coding_icd'],method: "GET"},
                      function(error, response, data) {
                         console.log("Got Result "+JSON.stringify(response))
                     });

       }

       if(result[0].phy_2_coding_icd != null){
            console.log("Second physician have already coded");
            //Check whether coding icds are equal or equivalent, If not send for Reconciliation

            request(
                    {uri: "http://localhost:7000/icdEquivalence/match?icd1="+req.body['phy_1_coding_icd']+"&icd2="+result[0].phy_2_coding_icd,method: "GET"},
                     function(error, response, data) {
                        console.log("Got Result "+JSON.stringify(response))
                    });
       }

       db.query(query_sql,[req.params.taskId],function (er, results, fields){
             if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
             else{
                console.log("Updating task "+JSON.stringify(results));
                return res.status(200).json(results);
             }
         })

       //return res.status(200).json(result);
     }

     });


  /*
  */

}
