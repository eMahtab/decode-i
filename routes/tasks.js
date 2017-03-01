var db=require('../db/db.js');

exports.retrieveTasks=function(req,res){
   console.log("Fetching tasks for physician "+req.params.physician);
   var sql = "SELECT * FROM tasks WHERE (phy_1_id="+req.params.physician+" OR phy_2_id="+req.params.physician+") AND task_status != 'Complete'";
   console.log("Query is "+sql);

   db.query(sql,function(err,result) {
    if (err) return res.status(500).send(err);
    return res.status(200).json(result);
    });
}


exports.updateTask=function(req,res){
    console.log("Task Id "+req.params.taskId);
    var update="";
    for(var key in req.body){
      console.log("Key: "+key+"  Value: "+req.body[key]);
      update=update+key+"="+"'"+req.body[key]+"' , "
    }

    var update_tasks="UPDATE tasks SET "+ update + " WHERE id=?";
    var last_comma=update_tasks.lastIndexOf(',');
    var query_sql=update_tasks.substring(0,last_comma)+" "+update_tasks.substring(last_comma+1)
    console.log("Update SQL "+query_sql)
    db.query(query_sql,[req.params.taskId],function (er, results, fields){
        if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
        else{
           console.log("Single update "+JSON.stringify(results));
           //return res.status(200).json(results);
        }
    })
}
