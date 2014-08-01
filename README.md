cantina-log
===========

JSON-powered logging for Cantina applications. Extends
[jog](https://github.com/visionmedia/jog) with some Cantina-specific
functionality.

Usage
-----

**Setting up your app:**

```js
var app = require('cantina').createApp();

app.boot(function (err) {

  // Load the logging plugin.
  app.require('cantina-log');

  // Load the rest of your plugins.

  app.start();
});
```

**Start logging...**

```js
// Perferred logging method:
app.log('type', {
  // data
})

// console.log-style logging.
app.log('My message with %s tokens in it', 'some');

// dump an object.
app.log({my: 'data'});

// Use levels:
app.log.info('type', { /* data */ });
app.log.debug('type', { /* data */ });
app.log.warn('type', { /* data */ });
app.log.error('type', { /* data */ });
```

Configuration
-------------

The following configuration (defaults shown) is supported.

```
{
  log: {
    trace: true,
    req: {
      enable: true,
      exclude: /(\.js$)|(\.css$)|(\/images.*)|(favicon.ico)|(\.hbs$)/
    }
  }
}
```

- **trace** - Adds file and line number to all log entries. Should be turned OFF
  in production.
- **req**
  - **enable** - Adds middleware that logs all requests.
  - **exclude** - A regular expression identifying paths to exclude from the logs.

Overriding console
------------------

- `app.log.replaceConsole()` - Override console's logging methods with app.log
   variants.
- `app.log.restoreConsole()` - Restore console to its orginal state.

Using a custom jog store
------------------------

**jog** logs using a 'store'. The default is `StdStore` which logs to stdout
and stderr. If you prefer to use a `FileStore`, `RedisStore`, or something
custom you can tell the app like so:

```js
var app = require('cantina').createApp()
  , jog = require('jog2');

app.boot(function (err) {
  // Pre-log app setup.

  // Specify your store.
  app.loggerStore = new jog.FileStore('/tmp/log');

  // Load the logging plugin.
  app.require('cantina-log');

  // Load the rest of your plugins.

  app.start();
});
```

Data serialization
------------------

You may find yourself logging simliar kinds of application object, such as
'user' models. You can log the raw user objects and implement a serializer to
santize it for the logs.

```js
app.hook('log:serialize').add(function (data, next) {
  if (data.user) {
    var user = data.user;
    data.user = {
      id: user.id,
      name: user.first + ' ' + user.last,
      // ... etc.
    };
  }
  next();
});
```

CLI
---

Now that your log output is in nice, parseable JSON, you may want to be
able to read it on the command-line in a more human-friendly format.
[Joli](http://github.com/cpsubrian/node-joli) is a CLI that helps you
format newline-separated JSON object (like the ones cantina-log outputs).

Please see **joli's** README for full documentation.

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
