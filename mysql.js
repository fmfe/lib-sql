'use strict';

const mysql = require('mysql');

// exports.connect = (config) => {
//     return mysql.createPool({
//         host: config.host || '127.0.0.1',
//         port: config.port || 3306,
//         database: config.database,
//         user: config.user,
//         password: config.password
//     });
// };

const mysqlPool = (config) => {
    console.log(config);
    return mysql.createPool({
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        database: config.database,
        user: config.user,
        password: config.password
    });
};

exports.init = mysqlPool;

exports.dataCenter = async (sql) => {
    return new Promise((resolve, reject) => {
        mysqlPool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            } else {
                conn.query(sql, (err, res) => {
                    if (err) {
                        conn.release();
                        reject(err);
                    }
                    conn.release();
                    resolve(res);
                });
            }
        });
    });
};
