const Duplex = require('readable-stream').Duplex
const inherits = require('util').inherits
const noop = function () {}

module.exports = MobilePortStream

inherits(MobilePortStream, Duplex)

/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
function MobilePortStream (port) {
  Duplex.call(this, {
    objectMode: true,
  })
  this._name = port.name;
  this._targetWindow = window;
  this._port = port;
  this._origin =  location.origin;
  window.addEventListener('message', this._onMessage.bind(this), false)
}

/**
 * Callback triggered when a message is received from
 * the remote Port associated with this Stream.
 *
 * @private
 * @param {Object} msg - Payload from the onMessage listener of Port
 */
MobilePortStream.prototype._onMessage = function (event) {
    console.log('MobilePortStream onMessage', event, "IS IFRAME?", window !== top);
    var msg = event.data

    // validate message
    if (this._origin !== '*' && event.origin !== this._origin){console.log("CONTENTSCRIPT: discarded by origin", this._origin, "IS IFRAME?", window !== top); return }
    //if (event.source !== this._targetWindow){console.log("CONTENTSCRIPT: discarded by source n window", this._targetWindow); return }
    if (typeof msg !== 'object'){console.log("CONTENTSCRIPT: discarded by typeof ms", msg, "IS IFRAME?", window !== top); return }
    if (typeof msg.data !== 'object'){console.log("CONTENTSCRIPT: discarded by typeof msg,data", msg.data, "IS IFRAME?", window !== top); return }
    
    if (msg.target && msg.target !== this._name){console.log("CONTENTSCRIPT: discarded by target/name", this._name, "IS IFRAME?", window !== top); return }
    
    if (!msg.data){console.log("CONTENTSCRIPT: discarded by !msg.data", msg.data, "IS IFRAME?", window !== top); return }
    // Filter outgoing messages
    if(msg.data.data && msg.data.data.toNative) {
        console.log("CONTENTSCRIPT: discarded by to native", "IS IFRAME?", window !== top);
        return;
    }

    console.log('CONTENTSCRIPT: MobilePortStream onMessage:push', msg, "IS IFRAME?", window !== top);

    if (Buffer.isBuffer(msg)) {
        delete msg._isBuffer
        var data = new Buffer(msg)
        this.push(data)
    } else {
        this.push(msg)
    }
}

/**
 * Callback triggered when the remote Port
 * associated with this Stream disconnects.
 *
 * @private
 */
MobilePortStream.prototype._onDisconnect = function () {
    this.destroy()
}

/**
 * Explicitly sets read operations to a no-op
 */
MobilePortStream.prototype._read = noop


/**
 * Called internally when data should be written to
 * this writable stream.
 *
 * @private
 * @param {*} msg Arbitrary object to write
 * @param {string} encoding Encoding to use when writing payload
 * @param {Function} cb Called when writing is complete or an error occurs
 */
MobilePortStream.prototype._write = function (msg, encoding, cb) {
    console.log('MobilePortStream _write', msg);

  try {
    if (Buffer.isBuffer(msg)) {
      var data = msg.toJSON()
      data._isBuffer = true
      console.log('MobilePortStream _write:postingMessage', data, "IS IFRAME?", window !== top);
      window.ReactNativeWebView.postMessage({...data, origin: window.location.href })
    } else {
      if(msg.data)msg.data.toNative = true;
      console.log('MobilePortStream _write:postingMessage', msg, "IS IFRAME?", window !== top);
      window.ReactNativeWebView.postMessage({...msg, origin: window.location.href })
    }
  } catch (err) {
    return cb(new Error('MobilePortStream - disconnected'))
  }
  cb()
}