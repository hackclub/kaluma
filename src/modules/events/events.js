/* Copyright 2015-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function EventEmitter() {
  this._events = {};
}

module.exports.EventEmitter = EventEmitter;

EventEmitter.prototype.emit = function (type) {
  if (!this._events) {
    this._events = {};
  }

  // About to emit 'error' event but there are no listeners for it.
  if (type === 'error' && !this._events.error) {
    var err = arguments[1];
    if (err instanceof Error) {
      throw err;
    } else {
      throw Error('Uncaught \'error\' event');
    }
  }

  var listeners = this._events[type];
  if (Array.isArray(listeners)) {
    listeners = listeners.slice();
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < listeners.length; ++i) {
      listeners[i].apply(this, args);
    }
    return true;
  }

  return false;
};


EventEmitter.prototype.addListener = function (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  if (!this._events) {
    this._events = {};
  }
  if (!this._events[type]) {
    this._events[type] = [];
  }

  this._events[type].push(listener);

  return this;
};

EventEmitter.prototype.removeListener = function (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  var listeners = this._events[type];
  if (Array.isArray(listeners)) {
    for (var i = listeners.length - 1; i >= 0; --i) {
      if (listeners[i] == listener ||
        (listeners[i].listener && listeners[i].listener == listener)) {
        listeners.splice(i, 1);
        if (!listeners.length) {
          delete this._events[type];
        }
        break;
      }
    }
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  if (arguments.length === 0) {
    this._events = {};
  } else {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.listeners = function (type) {
  return this._events[type] || [];
}

EventEmitter.prototype.listenerCount = function (type) {
  return this.listeners(type).length;
}

EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.once = function (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  var f = function () {
    // here `this` is this not global, because EventEmitter binds event object
    // for this when it calls back the handler.
    this.removeListener(f.type, f);
    f.listener.apply(this, arguments);
  };

  f.type = type;
  f.listener = listener;

  this.on(type, f);

  return this;
};
