var app = require('cantina')
  , jog = require('jog')
  , StdStore = require('jog-stdstore')
  , url = require('url')
  , http = require('http')
  , clone = require('clone');

// Default conf.
app.conf.add({
  log: {
    trace: true,
    req: {
      enable: true,
      exclude: /(\.js$)|(\.css$)|(\/images.*)|(favicon.ico)|(\.hbs$)/
    }
  }
});

// Create jog logger. Defaults to StdStore but allows app to override.
var store;
if (app.listeners('log:store').length) {
  store = app.invoke('log:store');
}
app.logger = jog(store || new StdStore());

/**
 * Logging that optionally includes default meta-data such as stack-trace info.
 *
 * See http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
 */
function log (type, data) {
  var self = this
    , args = Array.prototype.slice.call(arguments, 0)
    , stack
    , call;

  if (typeof type !== 'string') {
    data = {
      data: type
    };
    type = 'dump';
  }

  data = clone(data) || {};

  // Support printf style string formatting instead of jog type/data style.
  if (args.length > 2 || !data.constructor || data.constructor !== Object) {
    type = 'msg';
    data = {msg: app.utils.format.apply(null, args)};
  }

  // Optionally, find caller from stack.
  if (app.conf.get('log:trace')) {
    stack = getStackTrace(4);
    stack.shift();
    while (call = stack.shift()) {
      var name = call.getFunctionName();
      if (name && name.match(/^app\.log/)) continue;
      break;
    }
    data.src = {
      file: call.getFileName() ? call.getFileName().replace(app.root + '/', '') : '',
      line: call.getLineNumber()
    };
  }

  // Run data serializers.
  app.series('log:serialize', data, function (err) {
    if (err) return app.logger.error('log serialize', data);
    app.logger[self.level](type, data);
  });
};

// Create macros for different log levels.
app.log = log.bind({level: 'info'});
app.log.debug = log.bind({level: 'debug'});
app.log.info = log.bind({level: 'info'});
app.log.warn = log.bind({level: 'warn'});
app.log.error = log.bind({level: 'error'});

/**
 * Add middleware that logs all requests.
 */
if (app.middleware && app.conf.get('log:req:enable')) {
  app.middleware.add(function logRequest (req, res, next) {
    req.parsed = url.parse(req.url);
    if (!req.parsed.pathname.match(app.conf.get('log:req:exclude'))) {
      var orig = res.end;
      res.end = function() {
        app.log('request', {
          status: res.statusCode,
          req: req
        });
        orig.apply(res, arguments);
      };
      res.on('close', function () {
        app.log.warn('request closed', {
          status: res.statusCode,
          req: req
        });
      });
    }
    next();
  });
}

/**
 * Store references to original console methods.
 */
app.log.console = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  dir: console.dir
};

/**
 * Override console methods to use app.log instead.
 */
app.log.replaceConsole = function () {
  console.log = app.log.info;
  console.info = app.log.info;
  console.warn = app.log.warn;
  console.error = app.log.error;
  console.dir = app.log.debug;
};

/**
 * Resore the original console methods.
 */
app.log.restoreConsole = function () {
  console.log = app.log.console.info;
  console.info = app.log.console.info;
  console.warn = app.log.console.warn;
  console.error = app.log.console.error;
  console.dir = app.log.console.dir;
};

/**
 * Default serialization.
 */
app.on('ready', function () {
  app.on('log:serialize', function (data) {
    // Serialize req objects.
    if (data.req && data.req.url && data.req.headers) {
      var req = data.req;
      var parsed = req.parsed || url.parse(req.url);
      data.req = {
        method: req.method,
        url: {
          href: parsed.href,
          protocol: parsed.protocol,
          host: parsed.host,
          pathname: parsed.pathname,
          port: parsed.port,
          query: parsed.query,
          hash: parsed.hash
        },
        headers: req.headers
      };
    }

  });
});

/**
 * Get a stack trace N levels deep.
 */
function getStackTrace (depth) {
  var origTrace = Error.prepareStackTrace
    , origLimit = Error.stackTraceLimit
    , err
    , trace;

  Error.stackTraceLimit = depth;
  Error.prepareStackTrace = function(_, stack){ return stack; };

  err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  trace = err.stack;

  Error.stackTraceLimit = origLimit;
  Error.prepareStackTrace = origTrace;

  return trace;
}
