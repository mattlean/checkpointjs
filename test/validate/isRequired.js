/* eslint-disable no-console */
const { validate } = require('../../dist')

// Primitive
const primitiveData = 123
const primitiveValidationResult = validate(primitiveData, {
  schema: { isRequired: true },
  type: 'primitive'
})
console.log(primitiveValidationResult.pass) // true

// Object
const objectData = { foo: 123 }
const objectValidationResult = validate(objectData, {
  schema: {
    foo: { isRequired: true }
  },
  type: 'object'
})
console.log(objectValidationResult.pass) // true

// Array of primitives
const primitiveArrayData = [123, 456]
const primitiveArrayValidationResult = validate(primitiveArrayData, {
  schema: { isRequired: true },
  type: 'array',
  arrayType: 'primitive'
})
console.log(primitiveArrayValidationResult.pass) // true

// Array of objects
const objectArrayData = [{ foo: 123 }, { foo: 456 }]
const objectArrayValidationResult = validate(objectArrayData, {
  schema: { isRequired: true },
  type: 'array',
  arrayType: 'object'
})
console.log(objectArrayValidationResult.pass) // true
