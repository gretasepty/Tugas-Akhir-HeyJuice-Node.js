const mysql = require('mysql');

const konkesi = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'heyjuice',
    multipleStatements: true
});

konkesi.connect((err) => {
    if(err) throw err;
    console.log('MySQl Connected...');
});

module.exports = konkesi;