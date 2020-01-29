
const MetamaskInpageProvider = require('metamask-inpage-provider')
const createStandardProvider = require('./createStandardProvider').default
const ObjectMultiplex = require('obj-multiplex')
const pump = require('pump')
const MobilePortStream = require('./MobilePortStream')
const ReactNativePostMessageStream = require('./ReactNativePostMessageStream')

let warned = false

const metamaskStream = new ReactNativePostMessageStream({
  name: 'inpage',
  target: 'contentscript',
})

window.inpageProvider = new MetamaskInpageProvider(metamaskStream)

// compose the inpage provider
// set a high max listener count to avoid unnecesary warnings
window.inpageProvider.setMaxListeners(100)

let warnedOfAutoRefreshDeprecation = false
// augment the provider with its enable method
window.inpageProvider.enable = function ({ force } = {}) {
  if (
    !warnedOfAutoRefreshDeprecation &&
		window.inpageProvider.autoRefreshOnNetworkChange
  ) {
    console.warn(`MetaMask: MetaMask will soon stop reloading pages on network change.
If you rely upon this behavior, add a 'networkChanged' event handler to trigger the reload manually: https://metamask.github.io/metamask-docs/API_Reference/Ethereum_Provider#ethereum.on(eventname%2C-callback)
Set 'ethereum.autoRefreshOnNetworkChange' to 'false' to silence this warning: https://metamask.github.io/metamask-docs/API_Reference/Ethereum_Provider#ethereum.autorefreshonnetworkchange'
`)
    warnedOfAutoRefreshDeprecation = true
  }
  return new Promise((resolve, reject) => {
    window.inpageProvider.sendAsync({ method: 'eth_requestAccounts', params: (force && [force] || []) }, (error, response) => {
      if (error || response.error) {
        reject(error || response.error)
      } else {
        resolve(response.result)
      }
    })
  })
}

// give the dapps control of a refresh they can toggle this off on the window.ethereum
// this will be default true so it does not break any old apps.
window.inpageProvider.autoRefreshOnNetworkChange = true


const getPublicConfigWhenReady = async () => {
  const store = window.inpageProvider.publicConfigStore
  let state = store.getState()
  // if state is missing, wait for first update
  if (!state.networkVersion) {
    state = await new Promise(resolve => store.once('update', resolve))
  }
  return state
}

// add metamask-specific convenience methods
window.inpageProvider._metamask = new Proxy({
  /**
	 * Synchronously determines if this domain is currently enabled, with a potential false negative if called to soon
	 *
	 * @returns {boolean} - returns true if this domain is currently enabled
	 */
  isEnabled: function () {
    const { isEnabled } = window.inpageProvider.publicConfigStore.getState()
    return Boolean(isEnabled)
  },

  /**
	 * Asynchronously determines if this domain is currently enabled
	 *
	 * @returns {Promise<boolean>} - Promise resolving to true if this domain is currently enabled
	 */
  isApproved: async function () {
    const { isEnabled } = await getPublicConfigWhenReady()
    return Boolean(isEnabled)
  },

  /**
	 * Determines if MetaMask is unlocked by the user
	 *
	 * @returns {Promise<boolean>} - Promise resolving to true if MetaMask is currently unlocked
	 */
  isUnlocked: async function () {
    const { isUnlocked } = await getPublicConfigWhenReady()
    return Boolean(isUnlocked)
  },
}, {
  get: function (obj, prop) {
    !warned && console.warn('Heads up! ethereum._metamask exposes methods that have ' +
		'not been standardized yet. This means that these methods may not be implemented ' +
		'in other dapp browsers and may be removed from MetaMask in the future.')
    warned = true
    return obj[prop]
  },
})

// Work around for web3@1.0 deleting the bound `sendAsync` but not the unbound
// `sendAsync` method on the prototype, causing `this` reference issues
window.proxiedInpageProvider = new Proxy(window.inpageProvider, {
  // straight up lie that we deleted the property so that it doesnt
  // throw an error in strict mode
  deleteProperty: () => true,
})

window.ethereum = createStandardProvider(window.proxiedInpageProvider)

window.setupStreams = function () {
  // the transport-specific streams for communication between inpage and background
  const pageStream = new ReactNativePostMessageStream({
    name: 'contentscript',
    target: 'inpage',
  })

  const appStream = new MobilePortStream({
    name: 'contentscript',
  })

  // create and connect channel muxers
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
  forwardTrafficBetweenMuxers('provider', pageMux, appMux)
  forwardTrafficBetweenMuxers('publicConfig', pageMux, appMux)

}

function forwardTrafficBetweenMuxers (channelName, muxA, muxB) {
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
 * @param {string} remoteLabel Remote stream name
 * @param {Error} err Stream connection error
 */
function logStreamDisconnectWarning (remoteLabel, err) {
  let warningMsg = `MetamaskContentscript - lost connection to ${remoteLabel}`
  if (err) {
    warningMsg += '\n' + err.stack
  }
  console.warn(warningMsg)
  console.error(err)
}
