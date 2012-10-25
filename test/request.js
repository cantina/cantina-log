describe('request', function () {
  var app;

  beforeEach(function (done) {
    app = createTestApp({}, done);
  });

  afterEach(function (done) {
    app.destroy(done);
  });

  it('can log requests', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.level, 'info');
          assert.equal(obj.type, 'request');
          assert.equal(obj.req.url.pathname, '/hello');
          done();
        }
      };
    });

    app.conf.set('http:listen', false);

    require(app.plugins.http);
    require(app.plugins.middleware);
    require('../');

    app.middleware.get('/favicon.ico', function (req, res) {
      res.end('this would be the favicon');
    });

    app.middleware.get('/hello', function (req, res) {
      res.statusCode = 200;
      res.end('world');
    });

    app.init(function (err) {
      assert.ifError(err);
      request(app.http).get('/favicon.ico').end(function (err, res) {
        request(app.http).get('/hello').end(function (err, res) {
          assert.ifError(err);
        });
      });
    });
  });

});