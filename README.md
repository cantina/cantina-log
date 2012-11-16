cantina-log
===========

JSON-powered logging for Cantina applications. Extends
[jog](https://github.com/visionmedia/jog) with some Cantina-specific
functionality.

Usage
-----

**Setting up your app:**

```js
var app = require('cantina');

app.load(function (err) {

  // Load basic core plugins.
  require(app.plugins.http);
  require(app.plugins.middleware);

  // Load the logging plugin.
  require('cantina-log');

  // Load the rest of your plugins.

  app.init();
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
var app = require('cantina')
  , jog = require('jog2');

app.load(function (err) {
  // Pre-log app setup.

  // Specify your store.
  app.on('log:store', function () {
    return new jog.FileStore('/tmp/log');
  });

  // Load the logging plugin.
  require('cantina-log');

  // Load the rest of your plugins.

  app.init();
});
```

Data serialization
------------------

You may find your self logging simliar kinds of application object, such as
'user' models. You can log the raw user objects and implement a serializer to
santize it for the logs.

```js
app.on('log:serialize', function (data) {
  if (data.user) {
    var user = data.user;
    data.user = {
      id: user.id,
      name: user.first + ' ' + user.last,
      // ... etc.
    };
  }
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
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT
Copyright (C) 2012 Terra Eclipse, Inc. ([http://www.terraeclipse.com](http://www.terraeclipse.com))

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
