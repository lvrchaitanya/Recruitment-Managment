

const mysql = require('mysql2');

// const conn = mysql.createConnection({
//     host: 'localhost',
//   user: 'root',
//   password: 'root@3CR',
//   database: 'RMS',
    
//   });

const conn = mysql.createConnection({
    host: 'beqgv3ug2o9w7i9bgqji-mysql.services.clever-cloud.com',
  user: 'ugti3aaqcegyjizp',
  password: 'eId5bRnnAxbdvNgQBiFX',
  database: 'beqgv3ug2o9w7i9bgqji',
    
  });


  conn.connect((err)=>{
    if(err)
    console.log('its error '+ err);
    else
    console.log("connected...");

  });

  module.exports = conn;


