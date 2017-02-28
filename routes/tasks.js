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
