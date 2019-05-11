/* eslint-disable no-console */
const { validate } = require('../../dist')

// Primitive
const primitiveData = null
const primitiveValidationResult = validate(primitiveData, {
  schema: { allowNull: true },
  type: 'primitive'
})
console.log(primitiveValidationResult.pass) // true

// Object
const objectData = { foo: null }
const objectValidationResult = validate(objectData, {
  schema: {
    foo: { allowNull: true }
  },
  type: 'object'
})
console.log(objectValidationResult.pass) // true

// Array of primitives
const primitiveArrayData = [null, null]
const primitiveArrayValidationResult = validate(primitiveArrayData, {
  schema: { allowNull: true },
  type: 'array',
  arrayType: 'primitive'
})
console.log(primitiveArrayValidationResult.pass) // true

// Array of objects
const objectArrayData = [{ foo: null }, { foo: null }]
const objectArrayValidationResult = validate(objectArrayData, {
  schema: { allowNull: true },
  type: 'array',
  arrayType: 'object'
})
console.log(objectArrayValidationResult.pass) // true
