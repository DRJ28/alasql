if(typeof exports === 'object') {
	var assert = require("assert");
	var alasql = require('../alasql.js');
};

describe('Test 0', function() {
	it('0.1. Single statement CREATE, USE and DROP DATABASE', function(done){
		alasql('create database test00');
		assert(!!alasql.databases.test00);
		alasql('use test00');
		assert(alasql.useid == "test00");
		alasql('drop database test00');
		assert(!alasql.databases.test00);
		assert(alasql.useid == 'alasql');
		done();
	});

	it('0.2. Single statement CREATE, USE and DROP CREATE TABLE ', function(done){
		alasql('create database test00');
		alasql('use test00');
		alasql('create table one (a int)');
		assert(!!alasql.tables.one);
		alasql('insert into one values (10)')
		assert(alasql.tables.one.data.length == 1);
		var res = alasql.value('select sum(a) from one');
		assert(res == 10);
		alasql('drop database test00');		
		done();
	});

	it('0.3. Single statement CREATE, USE and DROP CREATE TABLE ', function(done){
		alasql('create database test00');
		alasql('use test00');
		alasql('create table one (a int)');
		var ins = alasql.compile('insert into one values (10)');
		ins();
		assert(alasql.tables.one.data.length == 1);
		var sel = alasql.compile('select sum(a) from one where a = ?','value');
		var res = sel([10]);
		var res = alasql.value('select sum(a) from one');
		assert(res == 10);
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 1);
		alasql('drop database test00');
		done();
	});

	it('0.4. Compile and reset cache', function(done){
		alasql('create database test00');
		alasql('use test00');
		alasql('create table one (a int)');
		alasql('insert into one (a) values (?)', [10]);
		alasql('insert into one (a) values (?)', [20]);
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 1);

		alasql('insert into one values (?)', [30]);
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 2);
		
		var res = alasql.array('select a from one order by a');
		assert.deepEqual(res,[10,20,30]);
		alasql.databases.test00.resetSqlCache();
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 0);

		alasql('insert into one (a) values (?)', [40]);
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 1);

		var ins = alasql.compile('insert into one values (?)')
		ins([50]);
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 1);

		alasql('insert into one (a) values (60); insert into one (a) values (70)');
		assert(Object.keys(alasql.databases.test00.sqlCache).length == 1);

		var res = alasql.value('select count(*) from one');
		assert(res == 7);

		var res = alasql.value('select sum(a) from one');
		assert(res == 280);

		alasql('drop database test00');	
		done();
	});

	it('0.5. INSERT INTO one SELECT ', function(done){
		alasql('create database test00');
		alasql('use test00');
		alasql('create table one (a int)');
		alasql('create table two (a int)');
		alasql('insert into one (a) values (?)', [10]);
		alasql('insert into two select * from one');
		var res = alasql.value('select * from two');
		assert(res = 10);
		alasql('drop database test00');	
		done();
	});	

	it('0.5. SELECT * INTO one ', function(done){
		alasql('create database test00');
		alasql('use test00');
		alasql('create table one (a int)');
		alasql('create table two (a int)');
		alasql('insert into one (a) values (?)', [10]);
		alasql('insert into two select * from one');
		var res = alasql.value('select * from two');
		assert(res = 10);
		alasql('drop database test00');	
		done();
	});	


});
