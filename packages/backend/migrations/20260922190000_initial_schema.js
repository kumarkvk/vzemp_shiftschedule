'use strict';

const fs = require('fs');
const path = require('path');

const migrationBaseName = '20260922190000_initial_schema';

const readSqlFile = (direction) =>
  fs.readFileSync(path.join(__dirname, `${migrationBaseName}.${direction}.sql`), 'utf8');

exports.up = function up(db, callback) {
  db.runSql(readSqlFile('up'), callback);
};

exports.down = function down(db, callback) {
  db.runSql(readSqlFile('down'), callback);
};
