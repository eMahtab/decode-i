var fs=require('fs');
var request=require('request');
var async=require('async');


var phases = ['mansa1'];

var endpointURL = process.env.ENDPOINT_URL || 'http://localhost:7000';

phases.forEach(function(phase) {
	

   fs.readdir(__dirname + '/' + phase, function(err, files) {

   	var vaRecordList = [];
    var count = 0;
   	var languageMap = { 'mansa1': 'Punjabi',  'anand': 'Gujarati'   };

     async.each(files, function(file, callback) {
             if(!file.endsWith('.json')) { return callback(); }             
             var vaRecordFile = phase + '/' + file;
             console.log("File :"+vaRecordFile);

             fs.readFile(__dirname + '/' + vaRecordFile, 'utf8', function(err, data) {
               if(err) { console.log('ERR: ' + JSON.stringify(err)); return callback(err); }
               var death = JSON.parse(data);
               if(!death.death) {return callback('deathId: ' + death.deathId + ' does not contain death');}
               var vaRecord = {
                  "deathId": death.deathId,
                  "study": "codstudy",
                  "phase": phase,              
                  "sex": death.death.sex,
                  "language": languageMap[phase],
                  "script": "Latin"                 
               };

             vaRecordList.push(vaRecord);
             callback();
             });
        },

        function(err) {
         if(err) { return console.log('ERR2: ' + JSON.stringify(err)); }
         console.log('Publishing Records to server.');
         request.post({
           url: endpointURL + '/vaRecord',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(vaRecordList)
         }, function(err, res, body) {
          if(err) { return console.log('ERR3: ' + JSON.stringify(err)); }
          if(res.statusCode !== 201) { return console.log('Problem publishing vaRecord: ' + JSON.stringify(body)) }
          console.log('Published ' + JSON.parse(body).length + ' Records.');
        });

    });


  });  


});	