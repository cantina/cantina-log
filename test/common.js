assert = require('assert');
util = require('util');
path = require('path');
fs = require('fs');
request = require('supertest');

/**
 * Set up an application with test config and a test database.
 */
createTestApp = function (conf, cb) {
  var app = require('cantina');
  app.load(function(err) {
    if (err) return cb(err);

    app.conf.unshift(conf);

    // Destroy an app:
    app.destroy = function(done) {
      // Clear require cache.
      Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key];
      });

      // Shut down http server.
      if (app.http) {
        app.http.close(done);
      }
      else {
        done();
      }
    };

    cb();
  });
  return app;
};

