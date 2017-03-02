var fs = require('fs'),
    request = require('request'),
    async = require('async');

var capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

var endpointURL = process.env.ENDPOINT_URL || 'http://localhost:7000';

fs.readFile(__dirname + '/icd_equivalence.csv', 'utf8', function(err, data) {
  if(err) { console.log('ERR: ' + JSON.stringify(err)); return err; }
  lines = data.split('\n');
  lines.shift();
  var icdEquivalenceList = [];
  lines.forEach(function(line) {
    var tokens = line.trim().split('\t');
    if(!line.trim()) { return console.log('Line: ^' + line + '$'); }
    var icdEquivalence = {
      description: tokens[0],
      icd: []
    };

    tokens[1].split(',').forEach(function(token) {
      icdEquivalence.icd.push(token);
    });
    icdEquivalenceList.push(icdEquivalence);
  });

  request.post({
    uri: endpointURL + '/icdEquivalence',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(icdEquivalenceList)
  }, function(err, res, body) {
    if(err) { console.log('ERR: ' + JSON.stringify(err)); return err; }
    if(res.statusCode !== 201) { console.log('Problem Publishing ICD Equivalence. Response Code: ' + res.statusCode); return console.log('BODY: ' + body); }
    console.log('Published ' + JSON.parse(body).length + ' equivalence families');
  });
});
