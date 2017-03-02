var db=require('../db/db.js');

exports.create=function(req,res){
   var sql = "INSERT INTO icd_equivalence (description,icds) VALUES ?";
   var body=req.body;
   //console.log("Body "+JSON.stringify(req.body));
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
