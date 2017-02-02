var db=require('../db/db.js');

exports.create=function(req,res){


   var sql = "INSERT INTO va_record (deathId,study,phase,sex,language,script) VALUES ?";
   var body=req.body;   
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

exports.getStudy=function(req,res){
   console.log("Distinct Study ");
   var sql = "SELECT distinct study FROM va_record";    
   db.query(sql,function(err,result) {
    if (err) return res.status(500).send(err);    
    return res.status(200).json(result); 
    });
}

exports.getPhase=function(req,res){
   console.log("Distinct Phase "+req.params.studyName);
   var sql = "SELECT distinct phase FROM va_record where study='"+req.params.studyName+"'";    
   db.query(sql,function(err,result) {
    if (err) return res.status(500).send(err);    
    return res.status(200).json(result); 
    });
}

exports.getPhaseRecords=function(req,res){
   console.log("Retreiving Phase Records "+req.params.study_name+'-'+req.params.phase_name);
   var sql = "SELECT deathId FROM va_record where study='"+req.params.study_name+"'"+" and phase='"+req.params.phase_name+"'";    
   db.query(sql,function(err,result) {
    if (err) return res.status(500).send(err);    
    return res.status(200).json(result); 
    });
}


function handleError(res, err) {
  return res.status(500).send(err);
}

