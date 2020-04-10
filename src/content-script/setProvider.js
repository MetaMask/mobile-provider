/* global Web3 */

let lastTimeUsed
let didInjectWeb3 = false

if (!window.chrome) {
  window.chrome = { webstore: true }
}

// inject web3
if (window.web3) {
  console.warn(`MetaMask detected another web3.
    MetaMask may not work reliably with web3 versions other than 0.20.7.`)
} else {

  window.web3 = new Web3(window.ethereum)

  window.web3.setProvider = function () {
    console.debug('MetaMask - overrode web3.setProvider')
  }

  setupWeb3AccountSync()
  setWeb3AsProxy()
  didInjectWeb3 = true

  console.debug('MetaMask - injected web3')
}

setupDappAutoReload(window.ethereum._publicConfigStore)

// functions

function setupWeb3AccountSync () {
  // set web3 defaultAccount
  window.ethereum._publicConfigStore.subscribe(state => {
    window.web3.eth.defaultAccount = state.selectedAddress
  })
}

function setWeb3AsProxy () {
  let hasBeenWarned = false

  window.web3 = new Proxy(window.web3, {
    get: (_web3, key) => {
      // get the time of use
      lastTimeUsed = Date.now()
      // show warning once on web3 access
      if (!hasBeenWarned && key !== 'currentProvider') {
        console.warn(`MetaMask: MetaMask will soon stop injecting web3. For more information, see: https://medium.com/metamask/no-longer-injecting-web3-js-4a899ad6e59e`)
        hasBeenWarned = true
      }
      // return value normally
      return _web3[key]
    },
    set: (_web3, key, value) => {
      // set value normally
      _web3[key] = value
    },
  })

}

function setupDappAutoReload (observable) {
  // export web3 as a window, checking for usage
  let reloadInProgress = false
  let lastSeenNetwork

  observable.subscribe(state => {
    // if the auto refresh on network change is false do not
    // do anything
    if (!window.ethereum.autoRefreshOnNetworkChange) {
      return
    }

    // if reload in progress, no need to check reload logic
    if (reloadInProgress) {
      return
    }

    const currentNetwork = state.networkVersion

    // set the initial network
    if (!lastSeenNetwork) {
      lastSeenNetwork = currentNetwork
      return
    }

    // skip reload logic if web3 not used
    if (!didInjectWeb3) {
      return
    }

    // if network did not change, exit
    if (currentNetwork === lastSeenNetwork) {
      return
    }

    // initiate page reload
    reloadInProgress = true
    const timeSinceUse = Date.now() - lastTimeUsed
    // if web3 was recently used then delay the reloading of the page
    if (timeSinceUse > 500) {
      triggerReset()
    } else {
      setTimeout(triggerReset, 500)
    }
  })
}

// reload the page
function triggerReset () {
  window.location.reload()
}
