var db=require('../db/db.js');

exports.create=function(req,res){
   var sql = "INSERT INTO icd_equivalence (description,icds) VALUES ?";
   var body=req.body;
   var disease=[];

   body.forEach(function(record){
      var icd=[];
      icd[0]=record["description"];
      icd[1]=record["icd"].toString();
      console.log("ICD "+icd[1]);
      disease.push(icd);

   });

   var insert_data=JSON.stringify(disease);
   console.log("Disease : "+insert_data);

   db.query(sql, [disease], function(err) {
    if (err) {console.log("Error "+JSON.stringify(err)); throw err;}
    return res.status(200).json(disease);
    });
}

exports.match=function(req,res){
  console.log("Query String "+req.query.icd1+"-"+req.query.icd2);
  var icd_sql="SELECT * from icd_equivalence where icds LIKE '%"+ req.query.icd1+"%' AND icds LIKE '%"+req.query.icd2+"%'";

  db.query(icd_sql,function(err,result) {
   if (err) return res.status(500).send(err);
   else{
        return res.status(200).json(result);
      }
   });
}
