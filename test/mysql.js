'use strict';

const sql = require('../index');

const mysqlPool = sql.mysql.init({
    database: 'test',
    user: 'root',
    password: '123456'
});
const _getNewSqlParamEntity = sql.mysql._getNewSqlParamEntity;

async function test () {
    const sqlParamsEntity = [];
    const sql1 = 'insert ?? set name = ?, age = ?, sex = ?';
    const param1 = ['tbl_user', 'test1', 20, 1];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql1, param1));

    const sql2 = 'insert ?? set name = ?, age = ?, sex = ?';
    const param2 = ['tbl_user', 'test2', 22, 0];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql2, param2));
    const data = await sql.mysql.execTrans(mysqlPool, sqlParamsEntity);

    // const sql1 = 'select * from ??';
    // const data = await sql.mysql.exec(mysqlPool, sql1, ['tbl_user']);
    console.log(data);
}

setTimeout(() => {
    test();
}, 2000);
