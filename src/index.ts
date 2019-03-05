/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */
import { cloneDeep } from 'lodash'
import { isIn as validatorIsIn, toDate } from 'validator'
/* eslint-enable import/no-extraneous-dependencies, import/no-unresolved */

import ERRS from './errs'
import {
  ResultValue,
  Rules,
  RulesArray,
  SchemaObject,
  SchemaObjectValidationResult,
  SchemaValue,
  SchemaValueValidationResult,
  TransformationCommand,
  TransformationCommands,
  ValidationArrayResult,
  ValidationArrayObjectResult,
  ValidationArrayPrimitiveResult,
  ValidationBaseResult,
  ValidationObjectResult,
  ValidationOptions,
  ValidationPrimitiveResult
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transform = (data: any, commands: TransformationCommand | TransformationCommands): any => {
  const c = Array.isArray(commands) ? commands : [commands]
  const d = data

  c.forEach(command => {
    if (typeof d === 'object' && !Array.isArray(d)) {
      Object.keys(d).forEach(key => {
        const currVal = d[key]

        if (command === 'clean') {
          if (currVal === undefined) delete d[key]
        } else if (command === 'trim') {
          if (typeof currVal === 'string') d[key] = currVal.trim()
        }
      })
    }
  })

  return d
}

/**
 * Checkpoint class
 * @function output Output data
 * @function validate Validate data with rules
 * @function transform Transform data with options
 */
export class Checkpoint {
  /**
   * Data to be validated or transformed
   */
  private data: any // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Create Checkpoint
   * @param data Data to be validated or transformed
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(data: any) {
    this.data = cloneDeep(data)
  }

  /**
   * Create new result value or build upon existing one
   * @param resultValue An existing result value or null if a new result value should be created
   * @param pass True if the result value passed, false if it failed
   * @param reason (Optional) Reason if the result value failed
   */
  private static createResultValue(resultValue: ResultValue | null, pass: boolean, reason?: string): ResultValue {
    const r = resultValue || { pass: true, reasons: [] }

    if (pass === false) {
      r.pass = false
      r.reasons.push(reason)
      r.pass = false
    }

    return r
  }

  /**
   * Creates a validation result to be returned by @function validate
   * @param rules Rules to validate data against
   * @param type Type of data to be validated
   * @param arrayType (Conditionally required) Type of array
   */
  /* eslint-disable lines-between-class-members, no-dupe-class-members, @typescript-eslint/no-explicit-any */
  private createValidationResult(rules: Rules, type: 'primitive', arrayType?): ValidationPrimitiveResult
  private createValidationResult(rules: Rules, type: 'object', arrayType?): ValidationObjectResult
  private createValidationResult(rules: Rules, type: 'array', arrayType: 'primitive'): ValidationArrayPrimitiveResult
  private createValidationResult(rules: Rules, type: 'array', arrayType: 'object'): ValidationArrayObjectResult
  private createValidationResult(rules, type, arrayType?): any {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const validationBaseResult: ValidationBaseResult = {
      pass: true,
      rules,
      showFailedResults() {
        const failedResults = []

        if (type === 'primitive') {
          if (!this.results.data.pass) {
            failedResults.push(...this.results.data.reasons)
          }
          return failedResults
        }

        if (type === 'object') {
          const resultsDataKeys = Object.keys(this.results.data)

          resultsDataKeys.forEach(key => {
            const currResult = this.results.data[key]
            if (!currResult.pass) {
              failedResults.push(...this.results.data[key].reasons)
            }
          })

          return failedResults
        }

        if (type === 'array') {
          if (arrayType === 'object') {
            this.results.data.forEach((obj, i) => {
              const resultsDataKeys = Object.keys(obj)

              resultsDataKeys.forEach(key => {
                const currResult = {
                  pass: obj[key].pass,
                  reasons: Array.from(obj[key].reasons)
                }
                if (!currResult.pass) {
                  currResult.reasons.forEach((reason, j) => {
                    currResult.reasons[j] = `[${i}]: ${reason}`
                  })
                  failedResults.push(...currResult.reasons)
                }
              })
            })
          }

          if (arrayType === 'primitive') {
            this.results.data.forEach((result, i) => {
              const currResult = {
                pass: result.pass,
                reasons: Array.from(result.reasons)
              }
              if (!currResult.pass) {
                currResult.reasons.forEach((reason, j) => {
                  currResult.reasons[j] = `[${i}]: ${reason}`
                })
                failedResults.push(...currResult.reasons)
              }
            })
          }

          return failedResults
        }

        throw new Error('Invalid type provided')
      },
      showPassedResults() {
        const passedResults = []

        if (type === 'primitive') {
          if (this.results.data.pass) {
            passedResults.push(String(this.data))
          }
          return passedResults
        }

        if (type === 'object') {
          const resultsDataKeys = Object.keys(this.results.data)

          resultsDataKeys.forEach(key => {
            const currResult = this.results.data[key]
            if (currResult.pass) {
              passedResults.push(key)
            }
          })

          return passedResults
        }

        if (type === 'array') {
          if (arrayType === 'object') {
            this.results.data.forEach((obj, i) => {
              const resultsDataKeys = Object.keys(obj)

              resultsDataKeys.forEach(key => {
                const currResult = obj[key]
                if (currResult.pass) {
                  passedResults.push(`[${i}]: ${key}`)
                }
              })
            })
          }

          if (arrayType === 'primitive') {
            this.results.data.forEach((currResult, i) => {
              if (currResult.pass) {
                passedResults.push(i)
              }
            })
          }

          return passedResults
        }

        throw new Error('Invalid type provided')
      }
    }

    if (type === 'primitive') {
      if (this.data !== null && typeof this.data === 'object') {
        throw new Error('Data is not a primitive type')
      }

      const validationPrimitiveResult: ValidationPrimitiveResult = {
        ...validationBaseResult,
        data: this.data,
        results: { data: { pass: true, reasons: [] } }
      }
      return validationPrimitiveResult
    }

    if (type === 'object') {
      if (this.data === null || typeof this.data !== 'object' || Array.isArray(this.data)) {
        throw new Error('Data is not an object')
      }

      const validationObjectResult: ValidationObjectResult = {
        ...validationBaseResult,
        data: this.data,
        results: { data: {}, missing: [], pass: true }
      }
      return validationObjectResult
    }

    if (type === 'array') {
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array')
      }

      if (this.data.length > 0) {
        if (arrayType === 'primitive' && typeof this.data[0] === 'object') {
          throw new Error('Data is not an array of primitive types')
        }

        if (arrayType === 'object' && (typeof this.data[0] !== 'object' || Array.isArray(this.data[0]))) {
          throw new Error('Data is not an array of objects')
        }
      }

      const validationArrayResult: ValidationArrayResult = {
        ...validationBaseResult,
        data: this.data,
        results: { data: [], missing: [], pass: true }
      }
      return validationArrayResult
    }

    throw new Error('Invalid type provided') // TODO: Implement CustomErr
  }
  /* eslint-enable lines-between-class-members, no-dupe-class-members */

  /**
   * Output data
   * @returns Data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public output(): any {
    return cloneDeep(this.data)
  }

  /**
   * Validate data
   * @param Rules Rules that data is validated with
   * @returns Validation result
   */
  public validate(rules: Rules): ValidationArrayResult | ValidationObjectResult | ValidationPrimitiveResult {
    let validationResult
    const { schema, options, type } = rules
    const o = options || {}

    if (type === 'primitive') {
      const schemaValueValidationResult = Checkpoint.validateSchemaValue(this.data, schema as SchemaValue, o, 'Value')
      const { result } = schemaValueValidationResult

      validationResult = this.createValidationResult(rules, 'primitive') as ValidationPrimitiveResult
      validationResult.results.data = result
      validationResult.pass = result.pass

      return validationResult
    }

    if (type === 'object') {
      const schemaObjectValidationResult = Checkpoint.validateSchemaObject(
        this.data,
        schema as SchemaObject,
        o,
        'object'
      )
      const { missing, pass, result } = schemaObjectValidationResult

      validationResult = this.createValidationResult(rules, 'object') as ValidationObjectResult
      validationResult.pass = pass
      validationResult.results.data = result
      validationResult.results.missing = missing
      validationResult.results.pass = pass

      return validationResult
    }

    if (type === 'array') {
      const { arrayType } = rules as RulesArray

      if (arrayType === 'object') {
        validationResult = this.createValidationResult(rules, 'array', 'object') as ValidationArrayResult

        for (let i = 0; i < this.data.length; i += 1) {
          const currData = this.data[i]
          const schemaObjectValidationResult = Checkpoint.validateSchemaObject(
            currData,
            schema as SchemaObject,
            o,
            'object'
          )
          const { exitASAPTriggered, missing, pass, result } = schemaObjectValidationResult

          validationResult.results.data.push(result)

          if (missing.length > 0) {
            validationResult.results.missing.push(i)
          }

          if (!pass) {
            if (validationResult.pass) {
              validationResult.pass = pass
            }

            if (validationResult.results.pass) {
              validationResult.results.pass = pass
            }
          }

          if (exitASAPTriggered) break
        }
      } else if (arrayType === 'primitive') {
        let atLeastOne = false
        const { requireMode } = o

        validationResult = this.createValidationResult(rules, 'array', 'primitive') as ValidationArrayResult

        for (let i = 0; i < this.data.length; i += 1) {
          const currData = this.data[i]
          const schemaValueValidationResult = Checkpoint.validateSchemaValue(
            currData,
            schema as SchemaValue,
            o,
            'Value'
          )
          const { atLeastOne: iterAtLeastOne, exitASAPTriggered, missing, result } = schemaValueValidationResult
          const { pass } = result

          validationResult.results.data.push(result)

          if (missing) {
            validationResult.results.missing.push(i)
          }

          if (!pass) {
            if (validationResult.pass) {
              validationResult.pass = pass
            }

            if (validationResult.results.pass) {
              validationResult.results.pass = pass
            }
          }

          if (requireMode === 'atLeastOne' && !atLeastOne && iterAtLeastOne) {
            atLeastOne = iterAtLeastOne
          }

          if (exitASAPTriggered) break
        }

        if (requireMode === 'atLeastOne' && !atLeastOne) {
          validationResult.pass = false
          validationResult.results.pass = false
          validationResult.results.data.push(Checkpoint.createResultValue(null, false, ERRS[3]()))
        }
      }

      return validationResult
    }

    throw new Error('Invalid type provided')
  }

  /**
   * Validate schema object
   * @param data Object data to be validated
   * @param schema (Optional) Schema to validate object data against
   * @param options (Optional) Options to influence validation process
   * @param errType (Optional) Determine formatting of error text
   */
  private static validateSchemaObject(
    data: object,
    schema: SchemaObject = {},
    options: ValidationOptions = {},
    errType?: 'object' | 'primitive'
  ): SchemaObjectValidationResult {
    const { exitASAP, requireMode } = options
    const returnData: SchemaObjectValidationResult = {
      missing: [],
      pass: true,
      result: {}
    }

    if (exitASAP) returnData.exitASAPTriggered = false
    if (requireMode === 'atLeastOne') returnData.atLeastOne = false

    const schemaKeys = Object.keys(schema)
    for (let i = 0; i < schemaKeys.length; i += 1) {
      const currKey = schemaKeys[i]
      const currValue = data[currKey]
      const schemaValueValidationResult = Checkpoint.validateSchemaValue(
        currValue,
        schema[currKey],
        options,
        currKey,
        errType
      )
      const { atLeastOne: iterAtLeastOne, exitASAPTriggered, missing, result } = schemaValueValidationResult

      returnData.result[currKey] = result
      if (!result.pass) returnData.pass = false

      if (missing) {
        returnData.missing.push(missing)
      }

      if (requireMode === 'atLeastOne' && !returnData.atLeastOne && iterAtLeastOne) {
        returnData.atLeastOne = iterAtLeastOne
      }

      if (exitASAPTriggered) {
        returnData.exitASAPTriggered = true
        return returnData
      }
    }

    if (requireMode === 'atLeastOne' && !returnData.atLeastOne) {
      returnData.pass = false
      returnData.result['requireMode'] = Checkpoint.createResultValue(null, false, ERRS[3]())
    }

    return returnData
  }

  /**
   * Validate schema value
   * @param value Value to be validated
   * @param schema (Optional) Schema to validate value against
   * @param options (Optional) Options to influence validation process
   * @param txt (Optional) Object key, array index, or text associated with value
   * @param errType (Optional) Determine formatting of error text
   */
  private static validateSchemaValue(
    value: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    schema: SchemaValue = {},
    options: ValidationOptions = {},
    txt?: string,
    errType?: 'object' | 'primitive'
  ): SchemaValueValidationResult {
    const { allowNull, isRequired, stringValidation, type } = schema
    const returnData: SchemaValueValidationResult = {
      missing: null,
      result: { pass: true, reasons: [] }
    }

    const { exitASAP, requireMode } = options

    if (exitASAP) returnData.exitASAPTriggered = false
    if (requireMode === 'atLeastOne') returnData.atLeastOne = false

    if (requireMode === 'atLeastOne') {
      if (value !== undefined && !returnData.atLeastOne) returnData.atLeastOne = true
    } else if ((isRequired || requireMode === 'all') && value === undefined) {
      // Missing required property
      returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[0](txt, errType))
      if (txt) returnData.missing = txt
      if (exitASAP) {
        returnData.exitASAPTriggered = true
        return returnData
      }
    }

    if (!allowNull && value === null && type !== 'null') {
      // Forbidden null
      returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[2](txt, errType))
      if (exitASAP) {
        returnData.exitASAPTriggered = true
        return returnData
      }
    }

    let valType
    if (value === null) valType = 'null'
    else valType = typeof value

    if (
      type &&
      ((value === null && type !== 'null' && !allowNull) ||
        ((value || value === '' || value === false) && valType !== type))
    ) {
      // Type mismatch
      returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[1](txt, type, valType, errType))
      if (exitASAP) {
        returnData.exitASAPTriggered = true
        return returnData
      }
    }

    if (
      stringValidation &&
      Object.keys(stringValidation).length > 0 &&
      valType === 'string' &&
      (type === 'string' || !type)
    ) {
      const { isDate, isIn, isLength } = stringValidation

      if (isDate) {
        if (toDate(value) === null) {
          returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[4](txt, errType))
          if (exitASAP) {
            returnData.exitASAPTriggered = true
            return returnData
          }
        }
      }

      if (Array.isArray(isIn)) {
        if (!validatorIsIn(value, isIn)) {
          returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[7](txt, isIn, errType))
          if (exitASAP) {
            returnData.exitASAPTriggered = true
            return returnData
          }
        }
      }

      if (isLength) {
        if (isLength.min && isLength.min > -1) {
          if (value.length < isLength.min) {
            returnData.result = Checkpoint.createResultValue(
              returnData.result,
              false,
              ERRS[5](txt, isLength.min, value.length, errType)
            )
            if (exitASAP) {
              returnData.exitASAPTriggered = true
              return returnData
            }
          }
        }

        if (isLength.max && isLength.max > -1) {
          if (value.length > isLength.max) {
            returnData.result = Checkpoint.createResultValue(
              returnData.result,
              false,
              ERRS[6](txt, isLength.max, value.length, errType)
            )
            if (exitASAP) {
              returnData.exitASAPTriggered = true
              return returnData
            }
          }
        }
      }
    }

    return returnData
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transform(commands: TransformationCommand | TransformationCommands): any {
    transform(this.data, commands)
    return this
  }
}

/**
 * Create a checkpoint
 * @param data Data to be assigned to the checkpoint
 * @returns Checkpoint
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkpoint = (data: any): Checkpoint => new Checkpoint(data)

export default checkpoint
