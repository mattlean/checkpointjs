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

## Function Reference
### General
####

### Validate
#### Functions
```javascript
// Direct Function Import
validate(data, rules)

// Checkpoint Instantiation
checkpoint(data).validate(rules)
```

#### Rules
##### Object
```typescript
interface ObjectValidationRules {
  options?: {
    exitASAP?: boolean
    requireMode?: 'all' | 'atLeastOne' | 'default'
  },
  schema?: {
    [key: string]: {
      allowNull?: boolean
      isRequired?: boolean
      stringValidation?: {
        isDate?: boolean
        isIn?: string[]
        isLength?: {
          max?: number
          min?: number
        }
      },
      type?: string
    }
  },
  type: 'object'
}
```

## License
This open source project is licensed under the [MIT License](https://github.com/IsaacLean/checkpointjs/blob/master/LICENSE).