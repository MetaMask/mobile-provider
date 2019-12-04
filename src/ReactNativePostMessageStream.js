const DuplexStream = require('readable-stream').Duplex
const inherits = require('util').inherits

module.exports = ReactNativePostMessageStream

inherits(ReactNativePostMessageStream, DuplexStream)

function ReactNativePostMessageStream (opts) {
  DuplexStream.call(this, {
    objectMode: true,
  })

  this._name = opts.name
  this._target = opts.target
  this._targetWindow = opts.targetWindow || window
  this._origin = (opts.targetWindow ? '*' : location.origin)
  
  window.addEventListener('message', this._onMessage.bind(this), false)
 
}

// private
ReactNativePostMessageStream.prototype._onMessage = function (event) {

    console.log('ReactNativePostMessageStream onMessage', event);

    var msg = event.data

    // validate message
    if (this._origin !== '*' && event.origin !== this._origin) return
    if (event.source !== this._targetWindow) return
    if (typeof msg !== 'object') return
    if (msg.target !== this._name) return
    if (!msg.data) return

 
    // forward message
    try {
        this.push(msg.data)
    } catch (err) {
        this.emit('error', err)
    }
  
}

// stream plumbing
ReactNativePostMessageStream.prototype._read = noop

ReactNativePostMessageStream.prototype._write = function (data, encoding, cb) {
  var message = {
    target: this._target,
    data: data,
  }
  this._targetWindow.postMessage(message, this._origin)
  cb()
}

// util

function noop () {}
