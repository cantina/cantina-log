describe('Basic Logging', function () {
  var app;

  // Log with trace: true.
  describe('with tracing', function () {

    before(function (done) {
      app = createTestApp({ log: { trace: true } }, done);
    });

    after(function (done) { app.destroy(done) });

    it('logs with correct callsite', function (done) {
      app.on('log:store', function testStore () {
        return {
          add: function (obj) {
            assert.equal(obj.type, 'test');
            assert.equal(obj.src.file, 'test/basic.js');
            assert.equal(obj.src.line, 29);
            done();
          }
        };
      });

      require('../');

      app.init(function (err) {
        assert.ifError(err);
        app.log('test');
      });
    });
  });

  // Log with trace: false.
  describe('with no tracing', function () {

    beforeEach(function (done) {
      app = createTestApp({ log: { trace: false } }, done);
    });

    afterEach(function (done) { app.destroy(done) });

    it('logs with correct callsite', function (done) {
      app.on('log:store', function () {
        return {
          add: function (obj) {
            assert.equal(obj.type, 'test');
            assert.equal(obj.src, undefined);
            done();
          }
        };
      });

      require('../');

      app.init(function (err) {
        assert.ifError(err);
        app.log('test');
      });
    });

    it('logs with data', function (done) {
      app.on('log:store', function () {
        return {
          add: function (obj) {
            assert.equal(obj.type, 'test with data');
            assert.equal(obj.a, 'A');
            assert.equal(obj.b, 'B');
            assert(obj.timestamp);
            done();
          }
        };
      });

      require('../');

      app.init(function (err) {
        app.log('test with data', {a: 'A', b: 'B'});
      });
    });

    it('logs a formatted string', function (done) {
      app.on('log:store', function () {
        return {
          add: function (obj) {
            assert.equal(obj.type, 'name: Brian Link');
            done();
          }
        };
      });

      require('../');

      app.init(function (err) {
        app.log('name: %s %s', 'Brian', 'Link');
      });
    });
  });
});