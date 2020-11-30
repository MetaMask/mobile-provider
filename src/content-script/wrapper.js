/* eslint-disable no-undef */
const fs = require('fs')
const path = require('path')

const inpageContent = fs.readFileSync(path.join(__dirname, '..', '..', '/', 'dist', 'inpage.js')).toString()

const code = `const inpageBundle = ${JSON.stringify(inpageContent)}`

fs.writeFileSync(path.join(__dirname, 'inpage-bundle.js'), code, 'ascii', () => {
  console.log('content-script.js generated succesfully')
})
