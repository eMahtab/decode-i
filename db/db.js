var mysql = require("mysql");
var db;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection({ host: "localhost", user: "root", password: "new1prog$",
          database:"decode-i"
        });

        db.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
    }
    return db;
}

module.exports = connectDatabase();
