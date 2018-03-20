'use strict';

const sql = require('../index');

const mysqlPool = sql.mysql.init({
    database: 'waihui',
    user: 'root',
    password: '123456'
});

async function test () {
    const data = await sql.mysql.dataCenter(mysqlPool, 'select * from t_category');
    console.log(data);
}

setTimeout(() => {
    test();
}, 2000);
