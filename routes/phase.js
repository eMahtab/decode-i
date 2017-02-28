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
  console.log("Initializing the phase")
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

            //  console.log("For push "+JSON.stringify(tasks));
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
     console.log("Doing Initial assignment");
     //first we have to find the number of records to be coded
     //find all the coder physicians
     //id of all coder physicians -
     //console.log("REQ Phase "+JSON.stringify(req));
     var phase_physicians=null;
     var first_coders_map={};    var second_coders_map={};

     var tasks=null;
     var coders=[];
     var first_coders=[];     var second_coders=[];
     var n=0;
     //
     var sql = "SELECT * FROM phase_physician where phase_name='"+req.params.phase_name+"'";
     db.query(sql,function(err,physicians) {
     if (err) return res.status(500).send(err);
      else{
          phase_physicians=physicians;
          phase_physicians.forEach(function(phy){
            if(phy.role.includes("coder")){
                coders.push(phy)
              }
            });

          for(n=0;n<coders.length;n++){
             if(n<coders.length/2){
              first_coders.push(coders[n]);
            }else{
              second_coders.push(coders[n]);
            }

          }
          console.log("First Coders "+JSON.stringify(first_coders));
          console.log("Second Coders "+JSON.stringify(second_coders));

          first_coders.forEach(function(coder){
            first_coders_map["P"+coder.physician_id]=0;
          });

          second_coders.forEach(function(coder){
            second_coders_map["P"+coder.physician_id]=0;
          });

          console.log("First MAP "+JSON.stringify(first_coders_map));
          console.log("Second MAP "+JSON.stringify(second_coders_map));

          //console.log("Physicians "+JSON.stringify(phase_physicians))
          //console.log("Coders "+JSON.stringify(coders));
          console.log("PHASE Name "+req.params.phase_name);
          var get_coding= "SELECT * FROM tasks where phase='"+req.params.phase_name+"'"+" AND task_status='Initialized'";
          //return res.status(200).json(result);
          db.query(get_coding,function(err,result) {
            if (err) return res.status(500).send(err);
            else{
              tasks=result;
              //get coding physicians
              console.log("Fetched all tasks "+tasks.length);
               var assignment_array=[];
              tasks.forEach(function(task){
                   var assignment=[]
                   assignment[0]=-1;
                   assignment[1]=-1;
                   assignment[2]=task.id;

                   for(var phy1 in first_coders_map){
                      var phy1_code_count=first_coders_map[phy1];
                      if(phy1_code_count<5){
                        assignment[0]=phy1.substring(1);
                        first_coders_map[phy1]=phy1_code_count+1;
                        break;
                        }
                   }
                   for(var phy2 in second_coders_map){
                     var phy2_code_count=second_coders_map[phy2];
                     if(phy2_code_count<5){
                       assignment[1]=phy2.substring(1);
                       second_coders_map[phy2]=phy2_code_count+1;
                       break;
                     }
                   }
                   assignment[2]=task.id;
                   if(assignment[0]!=-1 && assignment[1]!=-1){
                     assignment_array.push(assignment);
                     console.log("Coders Map "+JSON.stringify(first_coders_map)+JSON.stringify(second_coders_map));
                     console.log("Assignment "+assignment);
                     var update_tasks="UPDATE tasks SET phy_1_id=? , phy_2_id=?, task_status='Coding' where id=?";
                     db.query(update_tasks,assignment,function (er, results, fields){
                         if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
                         else{
                            console.log("Single update "+JSON.stringify(results));
                            //return res.status(200).json(results);
                         }
                     })

                   }
              });

            /*  console.log("Assignment array "+JSON.stringify(assignment_array));

                  var update_tasks="UPDATE tasks SET phy_1_id=? , phy_2_id=? where id=?";
                  db.query(update_tasks,[ ['-1','-1','10086'],['-1','-1','10087'] ],function (er, results, fields){
                      if (er) {console.log("Error "+JSON.stringify(er));return res.status(500).send(er);}
                      else{
                        return res.status(200).json(results);
                      }
                  })*/


              //return res.status(200).json(result);
            }

             });
       }

    });

     //return res.status(200).json({"message":"Great"});
}
