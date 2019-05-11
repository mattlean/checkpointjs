/* eslint-disable no-console */
const { validate } = require('../../dist')

// Primitive
const primitiveData = 'foo'
const primitiveValidationResult = validate(primitiveData, {
  schema: { type: 'string' },
  type: 'primitive'
})
console.log(primitiveValidationResult.pass) // true

// Object
const objectData = { foo: 123 }
const objectValidationResult = validate(objectData, {
  schema: {
    foo: { type: 'number' }
  },
  type: 'object'
})
console.log(objectValidationResult.pass) // true

// Array of primitives
const primitiveArrayData = [true, false]
const primitiveArrayValidationResult = validate(primitiveArrayData, {
  schema: { type: 'boolean' },
  type: 'array',
  arrayType: 'primitive'
})
console.log(primitiveArrayValidationResult.pass) // true

// Array of objects
const objectArrayData = [{ foo: 'bar' }, { foo: 'baz' }]
const objectArrayValidationResult = validate(objectArrayData, {
  schema: { type: 'string' },
  type: 'array',
  arrayType: 'object'
})
console.log(objectArrayValidationResult.pass) // true
