var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var db=require('./db/db.js');

var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var jwtSecret = 'kjwdjs65$ikksop0982shj';

var user=require('./routes/user.js');
var va_record=require('./routes/record.js');
var study=require('./routes/study.js');
var physician=require('./routes/physician.js');
var phase=require('./routes/phase.js');
var tasks=require('./routes/tasks.js');

var icdEquivalence=require('./routes/icd-equivalence.js');


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/cme-core/src'));
app.use(express.static(__dirname + '/cme-provisioning/src'));

app.use(bodyParser.json({limit: '50mb'}));

//app.use(expressJwt({ secret: jwtSecret }).unless({ path: ['/','/signup','/login']}));


//var routes=require('./routes/route.js');
//app.set('view engine','ejs');

//app.use(express.static(__dirname + '/src/public'));


app.get('/cme-core', function(req, res) {
   res.sendFile(__dirname +'/cme-core/src/cme-core.html'); // load our public/index.html file
});

app.get('/cme-provisioning', function(req, res) {
   res.sendFile(__dirname +'/cme-provisioning/src/cme-provisioning.html'); // load our public/index.html file
});

app.post('/physicianLogin',user.physicianLogin,function(req,res){
    var token = jwt.sign({username: req.body.username}, jwtSecret);
    res.status(200).send({token: token,username: req.body.username,id:req.body.id,role:req.body.role});
});

app.post('/provisioningLogin',user.provisioningLogin,function(req,res){
    var token = jwt.sign({username: req.body.username}, jwtSecret);
    res.status(200).send({token: token,username: req.body.username});
});

app.post('/vaRecord',va_record.create);
app.get('/vaRecord/:vaRecordId',va_record.getRecord);
app.get('/vaRecord/study/distinct',va_record.getStudy);
app.get('/vaRecord/study/distinct/:studyName/phase/distinct',va_record.getPhase);
app.get('/vaRecord/study/:study_name/phase/:phase_name',va_record.getPhaseRecords);

app.get('/study',study.get);
app.post('/study',study.create);

app.post('/physician',physician.create);
app.get('/physician',physician.get);

app.post('/phase',phase.create);
app.post('/phase/:phase_id/initialize',phase.initialize);
app.get('/phase',phase.get);
app.post('/phase/:phase_name/initialAssignment',phase.initialAssignment);

app.get('/tasks/physician/:physician',tasks.retrieveTasks);
app.post('/physician/:physician_id/role/:physician_role/task/:taskId',tasks.updateTask);
app.post('/assign_new_coding_task/phase/:phase_name/coder_id/:id',tasks.assignNewCoding);

app.post('/icdEquivalence',icdEquivalence.create);
app.get('/icdEquivalence/match',icdEquivalence.match);


var port = process.env.PORT || 7000;

var server=app.listen(port,function(req,res){
    console.log("Catch the action at http://localhost:"+port);
});
