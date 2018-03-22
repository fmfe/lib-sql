'use strict';

const mssql = require('mssql');
const async = require('async');
const _ = require('lodash');
const config = require('config');
const flag = config.has('mssql');
let mssqlConfig = {};
if (flag) {
    mssqlConfig = _.cloneDeep(config.get('mssql'));
}
// 执行单条sql语句
exports.exec = (sql, config) => {
    return new Promise((resolve, reject) => {
        config = config || mssqlConfig;
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

// sql server事务写法，支持多条语句
exports.execTrans = (sqlparamsEntities, config) => {
    return new Promise((resolve, reject) => {
        config = config || mssqlConfig;
        const connection = new mssql.ConnectionPool(config, (err) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            const transaction = new mssql.Transaction(connection);
            console.log('开始执行transaction，共执行' + sqlparamsEntities.length + '条数据');
            // 开启事物
            transaction.begin((err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                // 定义一个变量,如果自动回滚,则监听回滚事件并修改为true,无须手动回滚
                let rolledBack = false;

                // 监听回滚事件
                transaction.on('rollback', function (aborted) {
                    console.log('监听回滚');
                    console.log('aborted值 :', aborted);
                    rolledBack = true;
                });

                // 监听提交事件
                transaction.on('commit', function () {
                    console.log('监听提交');
                    rolledBack = true;
                });

                const request = new mssql.Request(transaction);
                const funcAry = [];
                sqlparamsEntities.forEach((sqlParam) => {
                    const temp = function (cb) {
                        const sql = sqlParam.sql;
                        request.query(sql, (err, result) => {
                            if (err) {
                                console.log(err);
                                cb(err, null);
                                return;
                            }
                            console.log('语句执行成功');
                            cb(null, result);
                        });
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    if (err) {
                        console.log('出现错误,执行回滚');
                        if (!rolledBack) {
                            // 如果sql语句错误会自动回滚,如果程序错误手动执行回滚,不然事物会一致挂起.
                            transaction.rollback(function (err) {
                                if (err) {
                                    console.log('rollback err :', err);
                                    reject(err);
                                }
                                console.log('回滚成功');
                            });
                        }
                    } else {
                        console.log('无错误,执行提交');
                        // 执行提交
                        transaction.commit(function (err) {
                            if (err) {
                                console.log('commit err :', err);
                                reject(err);
                            }
                            console.log('提交成功');
                            resolve(result);
                        });
                    }
                });
            });
        });
    });
};

exports._getNewSqlParamEntity = (sql, callback) => {
    if (callback) {
        return callback(null, {
            sql: sql
        });
    }
    return {
        sql: sql
    };
};
