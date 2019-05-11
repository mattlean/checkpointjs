/* eslint-disable no-console */
const { transform } = require('../../dist')

// Object
const objectData = { a: 123, b: undefined, c: 456, d: 789, e: undefined }
transform(objectData, 'clean')
console.log(objectData) // { a: 123, c: 456, d: 789 }
