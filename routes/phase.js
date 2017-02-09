var db=require('../db/db.js');
var request=require('request');

exports.create=function(req,res){
   var body=req.body;
   console.log("Phase Creation Body "+JSON.stringify(body));
   var phasePhysicians=body.selectedPhysicians.toString();
   var vaRecordsPhase=body.va_record_study.study+"::"+body.va_record_phase.phase;
   console.log("Phase "+JSON.stringify(req.body));
   var post_body={"study_name":body.study.name,"phase_name":body.phase,"physicians":phasePhysicians,
                  "va_records_phase":vaRecordsPhase,"status":"NOT_STARTED"}

   var sql = "INSERT INTO phase SET ?";    
   
   db.query(sql,post_body, function(err,result) {
    if (err) return res.status(500).send(err);
    //console.log("Last insert ID :"+result.insertId)
    else{

          var query = "INSERT INTO phase_physician(phase_name,physician_id,physician_name,physician_email,role) VALUES ?"; 
          var phase_physicians=[];
          body.selectedPhysicians.forEach(function(item){
                 var phy=[];
                 phy[0]=body.phase;
                 phy[1]=item.id;
                 phy[2]=item.name;
                 phy[3]=item.email;
                 phy[4]=item.role;
                 phase_physicians.push(phy);
          });

          db.query(query,[phase_physicians], function(er,data) {
              if (er) return res.status(500).send(er);
              return res.status(200).json(data); 
          });
      
    }
    
    });
}

exports.get=function(req,res){   
   var sql = "SELECT * FROM phase";     
   db.query(sql,function(err,result) {
    if (err) return res.status(500).send(err);    
    return res.status(200).json(result); 
    });
}

exports.initialize=function(req,res){
   var body=req.body;
   var record=body.va_records_phase.split("::");   

   request({uri: "http://localhost:7000/vaRecord/study/"+record[0]+"/phase/"+record[1],method: "GET"}, 
            function(error, response, data) {
              var va_records=JSON.parse(data);

              console.log("Total records are "+va_records.length);
              var tasks=[];
              va_records.forEach(function(death){
                   var task=[]

                   task[0]=body.study_name;
                   task[1]=body.phase_name;
                   task[2]=record[0];
                   task[3]=record[1];
                   task[4]=death.deathId;
                   task[5]="Initialized";

                   tasks.push(task);
              });

              console.log("For push "+JSON.stringify(tasks));
              var sql = "INSERT INTO tasks (study,phase,record_study,record_phase,record_id,task_status) VALUES ?"; 
              db.query(sql,[tasks], function(err,result) {
                if (err) return res.status(500).send(err);
                else{
                  var update_sql="UPDATE phase SET status=? where id=?";
                  db.query(update_sql,["IN_PROGRESS",body.id],function (er, results, fields){
                      if (er) return res.status(500).send(er);
                      else{
                        return res.status(200).json(results); 
                      }
                  })  
                }  

               });

           });
   
}

exports.initialAssignment=function(req,res){
     console.log("Initial assignment")
     return res.status(200).json({"message":"Great"}); 
}
