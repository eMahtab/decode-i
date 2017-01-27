var db=require('../db/db.js');

exports.create=function(req,res){

   console.log("Study "+JSON.stringify(req.body));
   var sql = "INSERT INTO study SET ?";
   
   
   db.query(sql,req.body, function(err,result) {
    if (err) return res.status(500).send(err);
    console.log("Last insert ID :"+result.insertId)
    return res.status(200).json(result); 
    });

}



