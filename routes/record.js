var db=require('../db/db.js');

exports.create=function(req,res){


   var sql = "INSERT INTO va_record (deathId,study,phase,sex,language,script) VALUES ?";
   var body=req.body;
   //console.log('Records '+JSON.stringify(body));
   var deaths=[];
   
   console.log("Deaths on server")
   body.forEach(function(record){
      var death=[];
      death[0]=record["deathId"]; death[1]=record["study"];
      death[2]=record["phase"]; death[3]=record["sex"];
      death[4]=record["language"]; death[5]=record["script"];
      console.log("Death "+death);
      deaths.push(death);

   });
   console.log("Deaths :"+deaths);
   db.query(sql, [deaths], function(err) {
    if (err) throw err;
    return res.status(200).json(deaths); 
    });

}


function handleError(res, err) {
  return res.status(500).send(err);
}

