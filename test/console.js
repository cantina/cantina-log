describe('console', function () {
  var app;

  beforeEach(function (done) {
    app = require('cantina');
    app.boot(done);
  });

  afterEach(function (done) {
    app.destroy(done);
  });

  it('can replace console.log', function (done) {
    app.loggerStore = {
      add: function (obj) {
        app.log.restoreConsole();
        assert.equal(obj.level, 'info');
        assert.equal(obj.type, 'console.log');
        done();
      }
    };

    require('../');
    app.log.replaceConsole();

    app.start(function (err) {
      assert.ifError(err);
      console.log('console.log');
    });
  });

  it('can replace console.info', function (done) {
    app.loggerStore = {
      add: function (obj) {
        app.log.restoreConsole();
        assert.equal(obj.level, 'info');
        assert.equal(obj.type, 'console.info');
        done();
      }
    };

    require('../');
    app.log.replaceConsole();

    app.start(function (err) {
      assert.ifError(err);
      console.info('console.info');
    });
  });

  it('can replace console.warn', function (done) {
    app.loggerStore = {
      add: function (obj) {
        app.log.restoreConsole();
        assert.equal(obj.level, 'warn');
        assert.equal(obj.type, 'console.warn');
        done();
      }
    };

    require('../');
    app.log.replaceConsole();

    app.start(function (err) {
      assert.ifError(err);
      console.warn('console.warn');
    });
  });

  it('can replace console.error', function (done) {
    app.loggerStore = {
      add: function (obj) {
        app.log.restoreConsole();
        assert.equal(obj.level, 'error');
        assert.equal(obj.type, 'console.error');
        done();
      }
    };

    require('../');
    app.log.replaceConsole();

    app.start(function (err) {
      assert.ifError(err);
      console.error('console.error');
    });
  });

  it('can replace console.dir', function (done) {
    app.loggerStore = {
      add: function (obj) {
        app.log.restoreConsole();
        assert.equal(obj.level, 'debug');
        assert.equal(obj.type, 'dump');
        assert.deepEqual(obj.data, {foo: 'bar'});
        done();
      }
    };

    require('../');
    app.log.replaceConsole();

    app.start(function (err) {
      assert.ifError(err);
      console.dir({foo: 'bar'});
    });
  });

  it('can log data without modifying it by reference', function (done) {
    app.loggerStore = {
      add: function (obj) {
        app.log.restoreConsole();
        assert.equal(obj.level, 'info');
        assert.equal(obj.type, 'dump');
        assert.equal(obj.data.name, 'Brian');
      }
    };

    require('../');
    app.log.replaceConsole();

    app.start(function (err) {
      assert.ifError(err);
      var data = {
        name: 'Brian',
        type: 'person',
        color: 'blue'
      };
      console.log(data);
      assert.equal(data.type, 'person');
      done();
    });
  });
});