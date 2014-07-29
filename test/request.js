describe('request', function () {
  var app;

  beforeEach(function (done) {
    app = require('cantina').createApp();
    app.boot(function (err) {
      assert.ifError(err);
      app.conf.add({
        web: {
          server: {
            listen: false
          },
          static: false,
          views: false
        }
      });
      done();
    });
  });

  afterEach(function (done) {
    app.destroy(done);
  });

  it('can log requests', function (done) {
    app.loggerStore = {
      add: function (obj) {
        assert.equal(obj.level, 'info');
        assert.equal(obj.type, 'request');
        assert.equal(obj.req.url.pathname, '/hello');
        done();
      }
    };

    app.require('cantina-web');
    app.require('../');

    app.middleware.get('/favicon.ico', function (req, res) {
      res.end('this would be the favicon');
    });

    app.middleware.get('/hello', function (req, res) {
      res.statusCode = 200;
      res.end('world');
    });

    app.start(function (err) {
      assert.ifError(err);
      request(app.server).get('/favicon.ico').end(function (err, res) {
        request(app.server).get('/hello').end(function (err, res) {
          assert.ifError(err);
        });
      });
    });
  });
});