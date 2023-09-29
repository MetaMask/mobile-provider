const { initializeProvider, shimWeb3 } = require('@metamask/providers');
const ObjectMultiplex = require('@metamask/object-multiplex');
const pump = require('pump');
const MobilePortStream = require('./MobilePortStream');
const ReactNativePostMessageStream = require('./ReactNativePostMessageStream');
const { v4: uuid } = require('uuid');

const INPAGE = 'metamask-inpage';
const CONTENT_SCRIPT = 'metamask-contentscript';
const PROVIDER = 'metamask-provider';

// Setup stream for content script communication
const metamaskStream = new ReactNativePostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
});

// Initialize provider object (window.ethereum)
initializeProvider({
  connectionStream: metamaskStream,
  shouldSendMetadata: false,
  providerInfo: {
    uuid: uuid(),
    name: "MetaMask Mobile",
    icon: "data:image/svg+xml,%3Csvg%20fill%3D%22none%22%20height%3D%2233%22%20viewBox%3D%220%200%2035%2033%22%20width%3D%2235%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%22.25%22%3E%3Cpath%20d%3D%22m32.9582%201-13.1341%209.7183%202.4424-5.72731z%22%20fill%3D%22%23e17726%22%20stroke%3D%22%23e17726%22%2F%3E%3Cg%20fill%3D%22%23e27625%22%20stroke%3D%22%23e27625%22%3E%3Cpath%20d%3D%22m2.66296%201%2013.01714%209.809-2.3254-5.81802z%22%2F%3E%3Cpath%20d%3D%22m28.2295%2023.5335-3.4947%205.3386%207.4829%202.0603%202.1436-7.2823z%22%2F%3E%3Cpath%20d%3D%22m1.27281%2023.6501%202.13055%207.2823%207.46994-2.0603-3.48166-5.3386z%22%2F%3E%3Cpath%20d%3D%22m10.4706%2014.5149-2.0786%203.1358%207.405.3369-.2469-7.969z%22%2F%3E%3Cpath%20d%3D%22m25.1505%2014.5149-5.1575-4.58704-.1688%208.05974%207.4049-.3369z%22%2F%3E%3Cpath%20d%3D%22m10.8733%2028.8721%204.4819-2.1639-3.8583-3.0062z%22%2F%3E%3Cpath%20d%3D%22m20.2659%2026.7082%204.4689%202.1639-.6105-5.1701z%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22m24.7348%2028.8721-4.469-2.1639.3638%202.9025-.039%201.231z%22%20fill%3D%22%23d5bfb2%22%20stroke%3D%22%23d5bfb2%22%2F%3E%3Cpath%20d%3D%22m10.8732%2028.8721%204.1572%201.9696-.026-1.231.3508-2.9025z%22%20fill%3D%22%23d5bfb2%22%20stroke%3D%22%23d5bfb2%22%2F%3E%3Cpath%20d%3D%22m15.1084%2021.7842-3.7155-1.0884%202.6243-1.2051z%22%20fill%3D%22%23233447%22%20stroke%3D%22%23233447%22%2F%3E%3Cpath%20d%3D%22m20.5126%2021.7842%201.0913-2.2935%202.6372%201.2051z%22%20fill%3D%22%23233447%22%20stroke%3D%22%23233447%22%2F%3E%3Cpath%20d%3D%22m10.8733%2028.8721.6495-5.3386-4.13117.1167z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m24.0982%2023.5335.6366%205.3386%203.4946-5.2219z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m27.2291%2017.6507-7.405.3369.6885%203.7966%201.0913-2.2935%202.6372%201.2051z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m11.3929%2020.6958%202.6242-1.2051%201.0913%202.2935.6885-3.7966-7.40495-.3369z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m8.392%2017.6507%203.1049%206.0513-.1039-3.0062z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m24.2412%2020.6958-.1169%203.0062%203.1049-6.0513z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m15.797%2017.9876-.6886%203.7967.8704%204.4833.1949-5.9087z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m19.8242%2017.9876-.3638%202.3584.1819%205.9216.8704-4.4833z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m20.5127%2021.7842-.8704%204.4834.6236.4406%203.8584-3.0062.1169-3.0062z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m11.3929%2020.6958.104%203.0062%203.8583%203.0062.6236-.4406-.8704-4.4834z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m20.5906%2030.8417.039-1.231-.3378-.2851h-4.9626l-.3248.2851.026%201.231-4.1572-1.9696%201.4551%201.1921%202.9489%202.0344h5.0536l2.962-2.0344%201.442-1.1921z%22%20fill%3D%22%23c0ac9d%22%20stroke%3D%22%23c0ac9d%22%2F%3E%3Cpath%20d%3D%22m20.2659%2026.7082-.6236-.4406h-3.6635l-.6236.4406-.3508%202.9025.3248-.2851h4.9626l.3378.2851z%22%20fill%3D%22%23161616%22%20stroke%3D%22%23161616%22%2F%3E%3Cpath%20d%3D%22m33.5168%2011.3532%201.1043-5.36447-1.6629-4.98873-12.6923%209.3944%204.8846%204.1205%206.8983%202.0085%201.52-1.7752-.6626-.4795%201.0523-.9588-.8054-.622%201.0523-.8034z%22%20fill%3D%22%23763e1a%22%20stroke%3D%22%23763e1a%22%2F%3E%3Cpath%20d%3D%22m1%205.98873%201.11724%205.36447-.71451.5313%201.06527.8034-.80545.622%201.05228.9588-.66255.4795%201.51997%201.7752%206.89835-2.0085%204.8846-4.1205-12.69233-9.3944z%22%20fill%3D%22%23763e1a%22%20stroke%3D%22%23763e1a%22%2F%3E%3Cpath%20d%3D%22m32.0489%2016.5234-6.8983-2.0085%202.0786%203.1358-3.1049%206.0513%204.1052-.0519h6.1318z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m10.4705%2014.5149-6.89828%202.0085-2.29944%207.1267h6.11883l4.10519.0519-3.10487-6.0513z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m19.8241%2017.9876.4417-7.5932%202.0007-5.4034h-8.9119l2.0006%205.4034.4417%207.5932.1689%202.3842.013%205.8958h3.6635l.013-5.8958z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
    rdns: "io.metamask.mobile"
  }
});
// Set content script post-setup function
Object.defineProperty(window, '_metamaskSetupProvider', {
  value: () => {
    setupProviderStreams();
    delete window._metamaskSetupProvider;
  },
  configurable: true,
  enumerable: false,
  writable: false,
});

// Functions

/**
 * Setup function called from content script after the DOM is ready.
 */
function setupProviderStreams() {
  // the transport-specific streams for communication between inpage and background
  const pageStream = new ReactNativePostMessageStream({
    name: CONTENT_SCRIPT,
    target: INPAGE,
  });

  const appStream = new MobilePortStream({
    name: CONTENT_SCRIPT,
  });

  // create and connect channel muxes
  // so we can handle the channels individually
  const pageMux = new ObjectMultiplex();
  pageMux.setMaxListeners(25);
  const appMux = new ObjectMultiplex();
  appMux.setMaxListeners(25);

  pump(pageMux, pageStream, pageMux, (err) =>
    logStreamDisconnectWarning('MetaMask Inpage Multiplex', err),
  );
  pump(appMux, appStream, appMux, (err) => {
    logStreamDisconnectWarning('MetaMask Background Multiplex', err);
    notifyProviderOfStreamFailure();
  });

  // forward communication across inpage-background for these channels only
  forwardTrafficBetweenMuxes(PROVIDER, pageMux, appMux);

  // add web3 shim
  shimWeb3(window.ethereum);
}

/**
 * Set up two-way communication between muxes for a single, named channel.
 *
 * @param {string} channelName - The name of the channel.
 * @param {ObjectMultiplex} muxA - The first mux.
 * @param {ObjectMultiplex} muxB - The second mux.
 */
function forwardTrafficBetweenMuxes(channelName, muxA, muxB) {
  const channelA = muxA.createStream(channelName);
  const channelB = muxB.createStream(channelName);
  pump(channelA, channelB, channelA, (err) =>
    logStreamDisconnectWarning(
      `MetaMask muxed traffic for channel "${channelName}" failed.`,
      err,
    ),
  );
}

/**
 * Error handler for page to extension stream disconnections
 *
 * @param {string} remoteLabel - Remote stream name
 * @param {Error} err - Stream connection error
 */
function logStreamDisconnectWarning(remoteLabel, err) {
  let warningMsg = `MetamaskContentscript - lost connection to ${remoteLabel}`;
  if (err) {
    warningMsg += `\n${err.stack}`;
  }
  console.warn(warningMsg);
  console.error(err);
}

/**
 * This function must ONLY be called in pump destruction/close callbacks.
 * Notifies the inpage context that streams have failed, via window.postMessage.
 * Relies on @metamask/object-multiplex and post-message-stream implementation details.
 */
function notifyProviderOfStreamFailure() {
  window.postMessage(
    {
      target: INPAGE, // the post-message-stream "target"
      data: {
        // this object gets passed to object-multiplex
        name: PROVIDER, // the object-multiplex channel name
        data: {
          jsonrpc: '2.0',
          method: 'METAMASK_STREAM_FAILURE',
        },
      },
    },
    window.location.origin,
  );
}
