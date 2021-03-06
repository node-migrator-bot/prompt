/*
 * helpers.js: test helpers for the prompt tests.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var events = require('events'),
    stream = require('stream'),
    util = require('util'),
    prompt = require('../lib/prompt');

var helpers = exports;

var MockReadWriteStream = helpers.MockReadWriteStream = function () {
  //
  // No need to do anything here, it's just a mock.
  //
};

util.inherits(MockReadWriteStream, events.EventEmitter);

['resume', 'pause', 'setEncoding', 'flush'].forEach(function (method) {
  MockReadWriteStream.prototype[method] = function () { /* Mock */ };
});

MockReadWriteStream.prototype.write = function (msg) {
  this.emit('data', msg);
};

//
// Create some mock streams for asserting against
// in our prompt teSts.
//
helpers.stdin = new MockReadWriteStream();
helpers.stdout = new MockReadWriteStream();
helpers.stderr = new MockReadWriteStream();

//
// Monkey punch `util.error` to silence console output
// and redirect to helpers.stderr for testing.
//
console.error = function () {
  helpers.stderr.write.apply(helpers.stderr, arguments);
}

// 1) .properties
// 2) warning --> message
// 3) Name --> description || key
// 4) validator --> conform (fxns), pattern (regexp), format (built-in)
// 5) empty --> required
helpers.schema = {
  properties: {
    oldschema: {
      message: 'Enter your username',
      validator: /^[\w|\-]+$/,
      warning: 'username can only be letters, numbers, and dashes',
      empty: false
    },
    riffwabbles: {
      pattern: /^[\w|\-]+$/,
      message: 'riffwabbles can only be letters, numbers, and dashes',
      default: 'foobizzles'
    },
    username: {
      pattern: /^[\w|\-]+$/,
      message: 'Username can only be letters, numbers, and dashes'
    },
    notblank: {
      required: true
    },
    password: {
      hidden: true,
      required: true
    },
    badValidator: {
      pattern: ['cant', 'use', 'array']
    },
    animal: {
      description: 'Enter an animal',
      default: 'dog',
      pattern: /dog|cat/
    },
    sound: {
      description: 'What sound does this animal make?',
      conform: function (value) {
        var animal = prompt.history(0).value;

        return animal === 'dog' && value === 'woof'
          || animal === 'cat' && value === 'meow';
      }
    },
    fnvalidator: {
      conform: function (line) {
        return line.slice(0,2) == 'fn';
      },
      message: 'fnvalidator must start with "fn"'
    }/*,
    cbvalidator: {
      conform: function (line, next) {
        next(line.slice(0,2) == 'cb');
      },
      message: 'cbvalidator must start with "cb"'
    }*/
  }
};
