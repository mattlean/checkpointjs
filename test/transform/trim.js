/* eslint-disable no-console */
const { transform } = require('../../dist')

// Object
const objectData = { a: 'hey    ', b: '    ho', c: '     let\'s go     ' }
transform(objectData, 'trim')
console.log(objectData) // { a: 'hey', c: 'ho', d: 'let\'s go' }