var mysql = require('mysql');
var pool = mysql.createConnection({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_jamesap',
  password        : '4994',
  database        : 'cs340_jamesap'
});
module.exports.pool = pool;

pool.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});