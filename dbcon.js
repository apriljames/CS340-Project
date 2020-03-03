var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_jamesap',
  password        : '4994',
  database        : 'cs340_jamesap'
});
module.exports.pool = pool;
