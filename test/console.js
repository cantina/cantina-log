describe('console', function () {
  var app;

  beforeEach(function (done) {
    app = createTestApp({}, done);
  });

  afterEach(function (done) {
    app.destroy(done);
  });

  it('can replace console.log', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.level, 'info');
          assert.equal(obj.type, 'console.log');
          app.log.restoreConsole();
          done();
        }
      };
    });

    require('../');
    app.log.replaceConsole();

    app.init(function (err) {
      assert.ifError(err);
      console.log('console.log');
    });
  });

  it('can replace console.info', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.level, 'info');
          assert.equal(obj.type, 'console.info');
          app.log.restoreConsole();
          done();
        }
      };
    });

    require('../');
    app.log.replaceConsole();

    app.init(function (err) {
      assert.ifError(err);
      console.info('console.info');
    });
  });

  it('can replace console.warn', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.level, 'warn');
          assert.equal(obj.type, 'console.warn');
          app.log.restoreConsole();
          done();
        }
      };
    });

    require('../');
    app.log.replaceConsole();

    app.init(function (err) {
      assert.ifError(err);
      console.warn('console.warn');
    });
  });

  it('can replace console.error', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.level, 'error');
          assert.equal(obj.type, 'console.error');
          app.log.restoreConsole();
          done();
        }
      };
    });

    require('../');
    app.log.replaceConsole();

    app.init(function (err) {
      assert.ifError(err);
      console.error('console.error');
    });
  });

  it('can replace console.dir', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.level, 'debug');
          assert.equal(obj.type, 'dump');
          assert.equal(obj.foo, 'bar');
          app.log.restoreConsole();
          done();
        }
      };
    });

    require('../');
    app.log.replaceConsole();

    app.init(function (err) {
      assert.ifError(err);
      console.dir({foo: 'bar'});
    });
  });
});