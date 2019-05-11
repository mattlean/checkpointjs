/* eslint-disable no-console */
const { transform } = require('../../dist')

// Object
const objectData = { a: 123, b: 456, c: 789 }
transform(objectData, { name: 'replace', options: [456, 'xyz'] })
console.log(objectData) // { a: 123, c: 'xyz', d: 789 }
