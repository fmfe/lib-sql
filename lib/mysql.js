'use strict';

const mysql = require('mysql');
const async = require('async');
// 初始化mysql连接
exports.init = (config) => {
    return mysql.createPool({
        connectionLimit: 10,
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        database: config.database,
        user: config.user,
        password: config.password
    });
};

// 执行单条sql语句
exports.exec = async (mysqlPool, sql, params = []) => {
    return new Promise((resolve, reject) => {
        mysqlPool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            } else {
                conn.query(sql, params, (err, rows, fields) => {
                    if (err) {
                        conn.release();
                        reject(err);
                    }
                    conn.release();
                    resolve(rows);
                });
            }
        });
    });
};

// mysql事务写法，支持多条语句
exports.execTrans = async (mysqlPool, sqlparamsEntities) => {
    return new Promise((resolve, reject) => {
        mysqlPool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    reject(err);
                }
                console.log('开始执行transaction，共执行' + sqlparamsEntities.length + '条数据');
                const funcAry = [];
                sqlparamsEntities.forEach((sqlParam) => {
                    const temp = function (cb) {
                        const sql = sqlParam.sql;
                        const param = sqlParam.params;
                        connection.query(sql, param, (err, rows, fields) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.log('事务失败，' + sqlParam + '，ERROR：' + err);
                                    connection.release();
                                    reject(err);
                                });
                            } else {
                                return cb(null, 'ok');
                            }
                        });
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    console.log('transaction error: ' + err);
                    if (err) {
                        connection.rollback(function (err) {
                            console.log('transaction error: ' + err);
                            connection.release();
                            reject(err);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            console.log('transaction info: ' + JSON.stringify(info));
                            if (err) {
                                console.log('执行事务失败，' + err);
                                connection.rollback(function (err) {
                                    console.log('transaction error: ' + err);
                                    connection.release();
                                    reject(err);
                                });
                            } else {
                                connection.release();
                                resolve(info);
                            }
                        });
                    }
                });
            });
        });
    });
};

exports._getNewSqlParamEntity = (sql, params, callback) => {
    if (callback) {
        return callback(null, {
            sql: sql,
            params: params
        });
    }
    return {
        sql: sql,
        params: params
    };
};
