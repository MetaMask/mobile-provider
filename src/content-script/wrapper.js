/* eslint-disable no-undef */
const fs = require('fs')
const path = require('path')
const inpageContent = fs.readFileSync(path.join(__dirname, '..','..', '/', 'dist', 'inpage.js')).toString();
const web3Js = fs.readFileSync(path.join(__dirname,'..','..', '/', 'node_modules','web3','dist','web3.min.js')).toString();
const setProviderContent = fs.readFileSync(path.join(__dirname,  'setProvider.js')).toString();

const code = `
    const inpageBundle = ${JSON.stringify(inpageContent)} + \n
                         ${JSON.stringify(web3Js)} + \n
                         ${JSON.stringify(setProviderContent)};
`;

fs.writeFileSync(path.join(__dirname, 'inpage-bundle.js'), code , 'ascii', () => {
    console.log('content-script.js generated succesfully');
});
