
const MetamaskInpageProvider = require('metamask-inpage-provider')
const ObjectMultiplex = require('obj-multiplex')
const pump = require('pump')
const MobilePortStream = require('./MobilePortStream')
const ReactNativePostMessageStream = require('./ReactNativePostMessageStream')

const metamaskStream = new ReactNativePostMessageStream({
  name: 'inpage',
  target: 'contentscript',
})

window.inpageProvider = new MetamaskInpageProvider(metamaskStream, false)

// compose the inpage provider
// set a high max listener count to avoid unnecesary warnings
window.inpageProvider.setMaxListeners(100)

// Work around for web3@1.0 deleting the bound `sendAsync` but not the unbound
// `sendAsync` method on the prototype, causing `this` reference issues
window.ethereum = new Proxy(window.inpageProvider, {
  // straight up lie that we deleted the property so that it doesnt
  // throw an error in strict mode
  deleteProperty: () => true,
})
delete window.inpageProvider

window.setupStreams = function () {
  // the transport-specific streams for communication between inpage and background
  const pageStream = new ReactNativePostMessageStream({
    name: 'contentscript',
    target: 'inpage',
  })

  const appStream = new MobilePortStream({
    name: 'contentscript',
  })

  // create and connect channel muxes
  // so we can handle the channels individually
  const pageMux = new ObjectMultiplex()
  pageMux.setMaxListeners(25)
  const appMux = new ObjectMultiplex()
  appMux.setMaxListeners(25)

  pump(
    pageMux,
    pageStream,
    pageMux,
    (err) => logStreamDisconnectWarning('MetaMask Inpage Multiplex', err),
  )
  pump(
    appMux,
    appStream,
    appMux,
    (err) => logStreamDisconnectWarning('MetaMask Background Multiplex', err),
  )

  // forward communication across inpage-background for these channels only
  forwardTrafficBetweenMuxes('provider', pageMux, appMux)
  forwardTrafficBetweenMuxes('publicConfig', pageMux, appMux)
}

/**
 * Set up two-way communication between muxes for a single, named channel.
 *
 * @param {string} channelName - The name of the channel.
 * @param {ObjectMultiplex} muxA - The first mux.
 * @param {ObjectMultiplex} muxB - The second mux.
 */
function forwardTrafficBetweenMuxes (channelName, muxA, muxB) {
  const channelA = muxA.createStream(channelName)
  const channelB = muxB.createStream(channelName)
  pump(
    channelA,
    channelB,
    channelA,
    (err) => logStreamDisconnectWarning(`MetaMask muxed traffic for channel "${channelName}" failed.`, err),
  )
}

/**
 * Error handler for page to extension stream disconnections
 *
 * @param {string} remoteLabel - Remote stream name
 * @param {Error} err - Stream connection error
 */
function logStreamDisconnectWarning (remoteLabel, err) {
  let warningMsg = `MetamaskContentscript - lost connection to ${remoteLabel}`
  if (err) {
    warningMsg += '\n' + err.stack
  }
  console.warn(warningMsg)
  console.error(err)
}
