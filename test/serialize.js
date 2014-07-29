describe('serialize', function () {
  var app;

  beforeEach(function (done) {
    app = require('cantina').createApp();
    app.boot(done);
  });

  afterEach(function (done) {
    app.destroy(done);
  });

  it('can serialize', function (done) {
    app.loggerStore = {
      add: function (obj) {
        assert.equal(obj.foo, 'baz');
        done();
      }
    };

    app.hook('log:serialize').add(function (data, next) {
      data.foo = data.foo.bar;
      next();
    });

    app.require('../');

    app.start(function (err) {
      assert.ifError(err);
      app.log('serialize', {foo: {bar: 'baz'}});
    });
  });
});