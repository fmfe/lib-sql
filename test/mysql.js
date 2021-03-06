const test = require('ava');
const { mysql } = require('../index');

const mysqlPool = mysql.init();
const _getNewSqlParamEntity = mysql._getNewSqlParamEntity;

test('one select sql', async t => {
    t.plan(1);
    const sql1 = 'select * from ?? limit 2';
    const data = await mysql.exec(mysqlPool, sql1, ['tbl_user']);
    t.is(data.length, 2);
});

test('mysql exec transaction sql', async t => {
    t.plan(2);
    const sqlParamsEntity = [];
    const sql1 = 'insert ?? set name = ?, age = ?, sex = ?';
    const param1 = ['tbl_user', 'test1', 20, 1];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql1, param1));

    const sql2 = 'insert ?? set name = ?, age = ?, sex = ?';
    const param2 = ['tbl_user', 'test2', 22, 0];
    sqlParamsEntity.push(_getNewSqlParamEntity(sql2, param2));
    const data = await mysql.execTrans(mysqlPool, sqlParamsEntity);
    t.is(data.serverStatus, 2);
    t.pass();
});
