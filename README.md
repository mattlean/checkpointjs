**THIS LIBRARY IS CURRENTLY UNSTABLE! USE AT YOUR OWN RISK!**

# Checkpoint.js
Validate and transform data.

## Setup
### Download
Install the [`checkpointjs` package](https://npmjs.com/package/checkpointjs) with a package manager like npm or Yarn.

You can also download and extract a release from here from the [Checkpoint.js GitHub repository releases page](https://github.com/IsaacLean/checkpointjs/releases).

### Using the Library
The library can be used in two different ways:

#### Direct Function Import
```javascript
import { validate } from 'checkpointjs'

const data = {
  foo: 'bar',
  123: 456
}

const result = validate(data, {
  schema: {
    foo: { isRequired: true, type: 'string' },
    123: { type: 'number' }
  },
  type: 'object'
})
```

#### Checkpoint Instantiation
```javascript
import checkpoint from 'checkpointjs'

const data = {
  foo: 'bar',
  123: 456
}

const result = checkpoint(data).validate({
  schema: {
    foo: { isRequired: true, type: 'string' },
    123: { type: 'number' }
  },
  type: 'object'
})
```

*Note: This library supports TypeScript. The source is completely written in it. Declaration files are included in the `dist/` folder.*

## API
### Validate
Validates the input data. Returns the results of the validation.

#### Functions
```javascript
// Direct Function Import
validate(data, rules)

// Checkpoint Instantiation
checkpoint(data).validate(rules)
```

#### Schema
##### allowNull
- Description: Determines if a null value is allowed.
- Type: `boolean`
- Default: `false`

```javascript
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
const objectArrayData = [
  { foo: null },
  { foo: null }
]
const objectArrayValidationResult = validate(objectArrayData, {
  schema: { allowNull: true },
  type: 'array',
  arrayType: 'object'
})
console.log(objectArrayValidationResult.pass) // true
```

##### isRequired
- Description: Determines if the value is required.
- Type: `boolean`
- Default: `false`

```javascript
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
const objectArrayData = [
  { foo: 123 },
  { foo: 456 }
]
const objectArrayValidationResult = validate(objectArrayData, {
  schema: { isRequired: true },
  type: 'array',
  arrayType: 'object'
})
console.log(objectArrayValidationResult.pass) // true
```

##### stringValidation
*TODO*

##### type
- Description: Requires a matching type for the value.
- Type: `string`

```javascript
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
const objectArrayData = [
  { foo: 'bar' },
  { foo: 'baz' }
]
const objectArrayValidationResult = validate(objectArrayData, {
  schema: { type: 'string' },
  type: 'array',
  arrayType: 'object'
})
console.log(objectArrayValidationResult.pass) // true
```

#### Options
*TODO*

### Transform
Transforms and mutates the input data. Returns the transformed data.

#### Functions
```javascript
// Direct Function Import
transform(data, commands)

// Checkpoint Instantiation
checkpoint(data).transform(commands)
```

#### Commands
##### clean
- Description: Removes undefined values.

```javascript
// Object
const objectData = { a: 123, b: undefined, c: 456, d: 789, e: undefined }
transform(objectData, 'clean')
console.log(objectData) // { a: 123, c: 456, d: 789 }
```

##### replace
- Description: Replaces values with another value.

```javascript
// Object
const objectData = { a: 123, b: 456, c: 789 }
transform(objectData, { name: 'replace', options: [456, 'xyz'] })
console.log(objectData) // { a: 123, c: 'xyz', d: 789 }
```

##### trim
- Description: Trims whitespace from strings.

```javascript
// Object
const objectData = { a: 'hey    ', b: '    ho', c: '     let\'s go     ' }
transform(objectData, 'trim')
console.log(objectData) // { a: 'hey', c: 'ho', d: 'let\'s go' }
```

### Checkpoint
*TODO*

## License
This open source project is licensed under the [MIT License](https://github.com/IsaacLean/checkpointjs/blob/master/LICENSE).