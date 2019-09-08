# in-memory

A `ndmr` example that loads "test data" into sqlite3 databases before querying.

See [`./config.json`](./config.json) for the config, and [`./query.json`](./query.json) for the query.

To run:

```
#
# ensure you're in examples/in-memory database first
#
ndmr execute
```

Expected output:

```
[ { id: 2, name: 'princess', isCute: 1 } ]
```

## Debugging

To debug, set `DEBUG=ndmr.*` as an environment variable.

Debug output:

```
ndmr.sqlite3 sink.connect: :memory: +0ms
ndmr.sqlite3 a.connect: :memory: +5ms
ndmr.sqlite3 b.connect: :memory: +2ms
ndmr.sqlite3 a.run(CREATE TABLE 'users' (id integer,name text,desc text)) +2ms
ndmr.sqlite3 b.run(CREATE TABLE 'animals' (id integer,name text,isCute integer)) +1ms
ndmr.sqlite3 b.run(INSERT INTO 'animals' VALUES (1,'mr cuddles',0)) +3ms
ndmr.sqlite3 b.run(INSERT INTO 'animals' VALUES (2,'princess',1)) +1ms
ndmr.sqlite3 a.run(INSERT INTO 'users' VALUES (1,'ben','human person')) +1ms
ndmr.sqlite3 a.run(INSERT INTO 'users' VALUES (2,'joni','unique human')) +1ms
ndmr.sqlite3 a.execute(SELECT id from users) +3ms
ndmr.sqlite3 b.execute(SELECT * from animals) +1ms
ndmr.sqlite3 sink.run(CREATE TABLE 'a' (id integer)) +2ms
ndmr.sqlite3 sink.run(CREATE TABLE 'b' (id integer,name text,isCute integer)) +1ms
ndmr.sqlite3 sink.run(INSERT INTO 'a' VALUES (1)) +1ms
ndmr.sqlite3 sink.run(INSERT INTO 'a' VALUES (2)) +1ms
ndmr.sqlite3 sink.run(INSERT INTO 'b' VALUES (1,'mr cuddles',0)) +1ms
ndmr.sqlite3 sink.run(INSERT INTO 'b' VALUES (2,'princess',1)) +1ms
ndmr.sqlite3 b.disconnect +3ms
ndmr.sqlite3 a.disconnect +2ms
ndmr.sqlite3 sink.execute(SELECT * FROM a INNER JOIN b ON a.id=b.id WHERE b.isCute=1) +2ms
ndmr.sqlite3 sink.disconnect +3ms
[ { id: 2, name: 'princess', isCute: 1 } ]
```
