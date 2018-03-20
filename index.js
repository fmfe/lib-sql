'use strict';

const mysql = require('./mysql');

mysql.init({
    database: 'waihui',
    user: 'root',
    password: '123456'
});

async function test () {
    // mysqlPool.getConnection((err, conn) => {
    //       if (err) {
    //           console.log(err);
    //       } else {
    //           conn.query('select * from t_category', (err, res) => {
    //               if (err) {
    //                   conn.release();
    //                   console.log(err);
    //               }
    //               conn.release();
    //               console.log(res);
    //           });
    //       }
    // });

    const data = await mysql.dataCenter('select * from t_category');
    console.log(data);
}

setTimeout(() => {
    test();
}, 2000);
