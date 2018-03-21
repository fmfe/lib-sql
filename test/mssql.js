const test = require('ava');
const sql = require('../index');
const config = require('./config.json');
const _getNewSqlParamEntity = sql.mssql._getNewSqlParamEntity;

test('sql server exec one select sql', async t => {
    t.plan(1);
    const sql1 = 'select Top 3 NickName, Vitality, OverstepRate from T_AnnualReport order by Vitality desc';
    const data = await sql.mssql.exec(config.mssql, sql1);
    t.is(data.recordset.length, 3);
});

test('sql server exec transaction sql', async t => {
    t.plan(2);
    const sqlParamsEntity = [];
    const sql1 = 'select * from T_AnnualReport where UserID = 105';
    sqlParamsEntity.push(_getNewSqlParamEntity(sql1));

    const sql2 = 'select * from T_AnnualReport where UserID = 104';
    sqlParamsEntity.push(_getNewSqlParamEntity(sql2));
    const data = await sql.mssql.execTrans(config.mssql, sqlParamsEntity);
    t.is(data.length, 2);
    t.pass();
});
