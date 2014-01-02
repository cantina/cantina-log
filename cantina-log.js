var app = require('cantina')
  , jog = require('jog')
  , StdStore = require('jog-stdstore')
  , url = require('url')
  , http = require('http')
  , format = require('util').format;

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
app.loggerStore = app.loggerStore || new StdStore();
app.logger = jog(app.loggerStore);

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
  // If single argument is a string, treat this as the log message
  else if (args.length === 1 && typeof type === 'string') {
    data = {
      msg: type
    };
    type = 'msg';
  }

  data || (data = {});

  // Support printf style string formatting instead of jog type/data style.
  if (args.length > 2 || !data.constructor || data.constructor !== Object) {
    type = 'msg';
    data = {
      msg: format.apply(null, args)
    };
  }

  // If data has its own toJSON() method, call it now so that properties
  // we add don't get lost, which they will if toJSON() is called later.
  if ({}.hasOwnProperty.call(data, 'toJSON')) {
    data = data.toJSON();
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

  //Include the amino id if present
  if (typeof app.amino !== 'undefined') {
    data.amino_id = app.amino.id;
  }

  // Run data serializers.
  app.hook('log:serialize').run(data, function (err) {
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
 * Add middleware that logs all requests. (If cantina-web was required).
 */
if (app.middleware && app.conf.get('log:req:enable')) {
  app.middleware.add(-700, function logRequest (req, res, next) {
    if (!req.href.pathname.match(app.conf.get('log:req:exclude'))) {
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
app.hook('log:serialize').add(function (data, next) {
  // Serialize req objects.
  if (data.req && data.req.href) {
    var req = data.req;
    data.req = {
      method: req.method,
      url: {
        href: req.href.href,
        protocol: req.href.protocol,
        host: req.href.host,
        pathname: req.href.pathname,
        port: req.href.port,
        query: req.href.query,
        hash: req.href.hash
      },
      headers: req.headers
    };
  }
  next();
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
