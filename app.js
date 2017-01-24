var express=require('express');
var app=express();

//var routes=require('./routes/route.js');
//app.set('view engine','ejs');

//app.use(express.static(__dirname + '/src/public'));
app.use(express.static(__dirname + '/src'));

app.get('/cme-core', function(req, res) {
   res.sendFile(__dirname +'/src/main.html'); // load our public/index.html file
});

var port = process.env.PORT || 7000;

var server=app.listen(port,function(req,res){
    console.log("Catch the action at http://localhost:"+port);
});
