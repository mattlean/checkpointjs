import { cloneDeep } from 'lodash'
import { isIn as validatorIsIn, toDate } from 'validator'

import ERRS from './errs'
import {
  OutputType,
  ResultValue,
  Rules,
  RulesArray,
  RulesObject,
  SchemaObjectValidationResult,
  SchemaValueValidationResult,
  SchemaValue,
  TransformationOptions,
  ValidationOptions,
  ValidationResult
} from './types'

/**
 * Checkpoint class
 * @function output Output data
 * @function validate Validate data with rules
 * @function transform Transform data with options
 */
export class Checkpoint {
  private data: any // eslint-disable-line @typescript-eslint/no-explicit-any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(data: any) {
    this.data = data
  }

  private static createResultValue(result: ResultValue | null, pass: boolean, reason?: string): ResultValue {
    const r = result || { pass: true, reasons: [] }

    if (pass === false) {
      r.pass = false
      r.reasons.push(reason)
      r.pass = false
    }

    return r
  }

  private createValidationResult(rules: Rules, type: 'array' | 'object' | 'primitive'): ValidationResult {
    const validationResult: Partial<ValidationResult> = {
      data: this.data,
      missing: [],
      pass: true,
      rules,
      // TODO: handle array type in show results methods
      showFailedResults(outputType?: OutputType) {
        const resultsKeys = Object.keys(this.results)

        let failedResults

        if (outputType === 'object') {
          failedResults = {}
        } else {
          failedResults = []
        }

        resultsKeys.forEach(key => {
          const currResult = this.results[key]
          if (!currResult.pass) {
            if (outputType === 'object') {
              failedResults[key] = currResult.reasons
            } else {
              failedResults.push(...this.results[key].reasons)
            }
          }
        })

        return failedResults
      },
      showPassedResults(outputType?: OutputType) {
        const resultsKeys = Object.keys(this.results)

        let passedResults

        if (outputType === 'object') {
          passedResults = {}
        } else {
          passedResults = []
        }

        resultsKeys.forEach(key => {
          const currResult = this.results[key]
          if (currResult.pass) {
            if (outputType === 'object') {
              passedResults[key] = true
            } else {
              passedResults.push(key)
            }
          }
        })

        return passedResults
      }
    }
    if (type === 'object') {
      validationResult.results = {}
    } else if (type === 'array') {
      validationResult.results = []
    }

    return validationResult as ValidationResult
  }

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
  public validate(rules: Rules): ValidationResult {
    let validationResult
    const { schema, options, type } = rules

    if (type === 'object') {
      validationResult = this.createValidationResult(rules, 'object')

      const schemaObjectValidationResult = Checkpoint.validateSchemaObject(
        this.data,
        schema as RulesObject['schema'],
        options
      )
      const { missing, pass } = schemaObjectValidationResult

      validationResult.missing = missing
      validationResult.pass = pass
      validationResult.results = schemaObjectValidationResult.result
    } else if (type === 'array') {
      validationResult = this.createValidationResult(rules, 'array')

      const { arrayType } = rules as RulesArray

      if (arrayType === 'object') {
        for (let i = 0; i < this.data.length; i += 1) {
          const currData = this.data[i]
          const schemaObjectValidationResult = Checkpoint.validateSchemaObject(
            currData,
            schema as RulesObject['schema'],
            options
          )
          const { pass } = schemaObjectValidationResult

          // TODO: handle missing here some how
          validationResult.pass = pass
          validationResult.results.push(schemaObjectValidationResult)
        }
      } // TODO: arrayType === 'primitive'
    }

    return validationResult
  }

  private static validateSchemaObject(
    data: object,
    schema: RulesObject['schema'],
    options: ValidationOptions = {}
  ): SchemaObjectValidationResult {
    const { requireMode } = options
    const returnData: SchemaObjectValidationResult = {
      atLeastOne: false,
      missing: [],
      pass: true,
      result: {}
    }

    const schemaKeys = Object.keys(schema)
    for (let i = 0; i < schemaKeys.length; i += 1) {
      const currKey = schemaKeys[i]
      const currValue = data[currKey]

      // add result to result
      const schemaValueValidationResult = Checkpoint.validateSchemaValue(currValue, schema[currKey], options, currKey)
      const { atLeastOne: iterAtLeastOne, exitASAPTriggered, missing, result } = schemaValueValidationResult

      returnData.missing = missing
      returnData.result[currKey] = result
      if (!result.pass) returnData.pass = false

      if (requireMode === 'atLeastOne' && !returnData.atLeastOne && iterAtLeastOne) {
        returnData.atLeastOne = iterAtLeastOne
      }
      if (exitASAPTriggered) break
    }

    if (requireMode === 'atLeastOne' && !returnData.atLeastOne) {
      returnData.pass = false
      returnData.result['requireMode'] = Checkpoint.createResultValue(null, false, ERRS[4]())
    }

    return returnData
  }

  private static validateSchemaValue(
    value: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    schema: SchemaValue,
    options: ValidationOptions = {},
    key?: number | string
  ): SchemaValueValidationResult {
    const { allowNull, isRequired, stringValidation, type } = schema
    const returnData: SchemaValueValidationResult = {
      atLeastOne: false,
      exitASAPTriggered: false,
      missing: [],
      result: { pass: true, reasons: [] }
    }

    const { exitASAP, requireMode } = options

    if (requireMode === 'atLeastOne') {
      if (value !== undefined && !returnData.atLeastOne) returnData.atLeastOne = true
    } else if ((isRequired || requireMode === 'all') && value === undefined) {
      // Missing required property
      returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[1](String(key)))
      returnData.missing.push(String(key))
      if (exitASAP) {
        returnData.exitASAPTriggered = true
        return returnData
      }
    }

    if (!allowNull && value === null && type !== 'null') {
      // Forbidden null
      returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[3](String(key)))
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
      returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[2](String(key), type, valType))
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
          returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[5](String(key)))
          if (exitASAP) {
            returnData.exitASAPTriggered = true
            return returnData
          }
        }
      }

      if (Array.isArray(isIn)) {
        if (!validatorIsIn(value, isIn)) {
          returnData.result = Checkpoint.createResultValue(returnData.result, false, ERRS[8](String(key), isIn))
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
              ERRS[6](String(key), isLength.min, value.length)
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
              ERRS[7](String(key), isLength.max, value.length)
            )
            if (exitASAP) {
              returnData.exitASAPTriggered = true
              return returnData
            }
          }
        }
      }
    }

    // Key value is valid
    if (!returnData.result) returnData.result = Checkpoint.createResultValue(returnData.result, true)

    return returnData
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transform(options: TransformationOptions): any {
    return this.data // TODO
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
