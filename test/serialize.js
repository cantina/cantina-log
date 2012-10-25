describe('serialize', function () {
  var app;

  beforeEach(function (done) {
    app = createTestApp({}, done);
  });

  afterEach(function (done) {
    app.destroy(done);
  });

  it('can serialize', function (done) {
    app.on('log:store', function testStore () {
      return {
        add: function (obj) {
          assert.equal(obj.foo, 'baz');
          done();
        }
      };
    });

    app.on('log:serialize', function (data) {
      data.foo = data.foo.bar;
    });

    require('../');

    app.init(function (err) {
      assert.ifError(err);
      app.log('serialize', {foo: {bar: 'baz'}});
    });
  });
});