describe('Basic Logging', function () {
  var app;

  // Log with trace: true.
  describe('with tracing', function () {

    before(function (done) {
      app = require('cantina');
      app.boot(function (err) {
        assert.ifError(err);
        app.conf.add({
          log: {
            trace: true
          }
        });
        done();
      });
    });

    after(function (done) {
      app.destroy(done);
    });

    it('logs with correct callsite', function (done) {
      app.loggerStore = {
        add: function (obj) {
          assert.equal(obj.msg, 'test');
          assert.equal(obj.src.file, 'test/basic.js');
          assert.equal(obj.src.line, 38);
          done();
        }
      };

      require('../');

      app.start(function (err) {
        assert.ifError(err);
        app.log('test');
      });
    });
  });

  // Log with trace: false.
  describe('with no tracing', function () {

    beforeEach(function (done) {
      app = require('cantina');
      app.boot(function (err) {
        assert.ifError(err);
        app.conf.add({
          log: {
            trace: false
          }
        });
        done();
      });
    });

    afterEach(function (done) {
      app.destroy(done);
    });

    it('logs with correct callsite', function (done) {
      app.loggerStore = {
        add: function (obj) {
          assert.equal(obj.msg, 'test');
          assert.equal(obj.src, undefined);
          done();
        }
      };

      require('../');

      app.start(function (err) {
        assert.ifError(err);
        app.log('test');
      });
    });

    it('logs with data', function (done) {
      app.loggerStore = {
        add: function (obj) {
          assert.equal(obj.type, 'test with data');
          assert.equal(obj.a, 'A');
          assert.equal(obj.b, 'B');
          assert(obj.timestamp);
          done();
        }
      };

      require('../');

      app.start(function (err) {
        app.log('test with data', {a: 'A', b: 'B'});
      });
    });

    it('logs a formatted string', function (done) {
      app.loggerStore = {
        add: function (obj) {
          assert.equal(obj.type, 'msg');
          assert.equal(obj.msg, 'name: Brian Link');
          done();
        }
      };

      require('../');

      app.start(function (err) {
        app.log('name: %s %s', 'Brian', 'Link');
      });
    });

    it('logs data having a toJSON method', function (done) {
      app.loggerStore = {
        add: function (obj) {
          obj = JSON.parse(JSON.stringify(obj));
          assert.equal(obj.type, 'test data having toJSON');
          assert.equal(obj.a, 'A');
          assert.equal(obj.b, 'B');
          assert.equal(obj.ab, 'AB');
          assert(obj.timestamp);
          done();
        }
      };

      require('../');
      var data = {
        a: 'A',
        b: 'B',
        toJSON: function () {
          return {
            a: this.a,
            b: this.b,
            ab: this.a + this.b
          }
        }
      }

      app.start(function (err) {
        app.log('test data having toJSON', data);
      });
    });
  });
});