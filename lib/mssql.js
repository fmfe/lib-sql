'use strict';

const mssql = require('mssql');

function _Base () {
}

const config = {
};

// _Base.prototype._connect = function () {
//     return new Promise((resolve, reject) => {
//         const connection = new mssql.ConnectionPool(config);
//         resolve(connection);
//     });
// };

_Base.prototype.exec = (sql) => {
    return new Promise((resolve, reject) => {
        const connection = new mssql.ConnectionPool(config, (err) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            const ps = new mssql.PreparedStatement(connection);
            ps.prepare(sql, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                ps.execute('', (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }

                    ps.unprepare((err) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        resolve(result);
                    });
                });
            });
        });
    });
};
const mssqlClient = new _Base();
module.exports = mssqlClient;
