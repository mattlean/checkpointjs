import { cloneDeep } from 'lodash'
import { isIn as validatorIsIn, toDate } from 'validator'

import ERRS from './errs'
import {
  OutputType,
  Rules,
  TransformationOptions,
  ValidationOptions,
  ValidationResult,
  ValidationSchema
} from './types'

/**
 * Checkpoint class
 * @function output Output data
 * @function validate Validate data with rules
 * @function transform Transform data with options
 */
export class Checkpoint {
  private data: any // eslint-disable-line @typescript-eslint/no-explicit-any

  public constructor(data) {
    this.data = data
  }

  private static addResult(
    validationResult: ValidationResult,
    type: 'array' | 'object' | 'primitive' | 'requireMode',
    key: number | string,
    pass: boolean,
    reason?: string
  ): ValidationResult {
    const vr = validationResult

    let result

    if (type === 'array' || type === 'object') {
      if (!vr.results[key]) vr.results[key] = { pass, reasons: [] }
      result = vr.results[key]
    } else if (type === 'primitive') {
      vr.results = { pass, reasons: [] }
      result = vr.results
    }

    if (pass === false) {
      result.pass = false
      result.reasons.push(reason)
      vr.pass = false
    }

    return vr
  }

  private createValidationResult(rules: Rules): ValidationResult {
    return {
      data: this.data,
      missing: [],
      pass: true,
      results: {},
      rules,
      showFailedResults(type?: OutputType) {
        const resultsKeys = Object.keys(this.results)

        let failedResults

        if (type === 'object') {
          failedResults = {}
        } else {
          failedResults = []
        }

        resultsKeys.forEach(key => {
          const currResult = this.results[key]
          if (!currResult.pass) {
            if (type === 'object') {
              failedResults[key] = currResult.reasons
            } else {
              failedResults.push(...this.results[key].reasons)
            }
          }
        })

        return failedResults
      },
      showPassedResults(type?: OutputType) {
        const resultsKeys = Object.keys(this.results)

        let passedResults

        if (type === 'object') {
          passedResults = {}
        } else {
          passedResults = []
        }

        resultsKeys.forEach(key => {
          const currResult = this.results[key]
          if (currResult.pass) {
            if (type === 'object') {
              passedResults[key] = true
            } else {
              passedResults.push(key)
            }
          }
        })

        return passedResults
      }
    }
  }

  /**
   * Output data
   * @returns Data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public output(): any {
    return cloneDeep(this.data)
  }

  private validateObject(validationResult, rules): ValidationResult {
    const vr = validationResult
    const { schema } = rules
    const schemaKeys = Object.keys(schema)
    const options = rules.options || {}
    const { requireMode } = options
    let atLeastOne

    for (let i = 0; i < schemaKeys.length; i += 1) {
      const currKey = schemaKeys[i]
      const currVal = this.data[currKey]

      const iterAtLeastOne = Checkpoint.validateSchema(validationResult, currVal, schema[currKey], options, currKey)
        .atLeastOne
      if (!atLeastOne && iterAtLeastOne) atLeastOne = iterAtLeastOne
    }

    if (requireMode === 'atLeastOne' && !atLeastOne) {
      vr.pass = false
      Checkpoint.addResult(vr, 'object', 'requireMode', false, ERRS[4]())
    }

    return vr
  }

  private static validateSchema(
    validationResult: ValidationResult,
    val: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    schema: ValidationSchema,
    options?: ValidationOptions,
    key?: number | string
  ): { validationResult: ValidationResult; atLeastOne: boolean } {
    const vr = validationResult
    const { allowNull, isRequired, stringValidation, type } = schema
    const returnData = { atLeastOne: false, validationResult: vr }

    const o = options || {}
    const { exitASAP, requireMode } = o

    if (requireMode === 'atLeastOne') {
      if (val !== undefined && !returnData.atLeastOne) returnData.atLeastOne = true
    } else if ((isRequired || requireMode === 'all') && val === undefined) {
      // Missing required property
      Checkpoint.addResult(vr, 'object', key, false, ERRS[1](String(key)))
      vr.missing.push(String(key))
      if (exitASAP) return returnData
    }

    if (!allowNull && val === null && type !== 'null') {
      // Forbidden null
      Checkpoint.addResult(vr, 'object', key, false, ERRS[3](String(key)))
      if (exitASAP) return returnData
    }

    let valType
    if (val === null) valType = 'null'
    else valType = typeof val

    if (
      type &&
      ((val === null && type !== 'null' && !allowNull) || ((val || val === '' || val === false) && valType !== type))
    ) {
      // Type mismatch
      Checkpoint.addResult(vr, 'object', key, false, ERRS[2](String(key), type, valType))
      if (exitASAP) return returnData
    }

    if (
      stringValidation &&
      Object.keys(stringValidation).length > 0 &&
      valType === 'string' &&
      (type === 'string' || !type)
    ) {
      const { isDate, isIn, isLength } = stringValidation

      if (isDate) {
        if (toDate(val) === null) {
          Checkpoint.addResult(vr, 'object', key, false, ERRS[5](String(key)))
          if (exitASAP) return returnData
        }
      }

      if (Array.isArray(isIn)) {
        if (!validatorIsIn(val, isIn)) {
          Checkpoint.addResult(vr, 'object', key, false, ERRS[8](String(key), isIn))
          if (exitASAP) return returnData
        }
      }

      if (isLength) {
        if (isLength.min && isLength.min > -1) {
          if (val.length < isLength.min) {
            Checkpoint.addResult(vr, 'object', key, false, ERRS[6](String(key), isLength.min, val.length))
            if (exitASAP) return returnData
          }
        }

        if (isLength.max && isLength.max > -1) {
          if (val.length > isLength.max) {
            Checkpoint.addResult(vr, 'object', key, false, ERRS[7](String(key), isLength.max, val.length))
            if (exitASAP) return returnData
          }
        }
      }
    }

    // Key value is valid
    if (!vr.results[key]) Checkpoint.addResult(vr, 'object', key, true)

    return returnData
  }

  /**
   * Validate data
   * @param Rules Rules that data is validated with
   * @returns Validation result
   */
  public validate(rules: Rules): ValidationResult {
    if (typeof this.data !== 'object' || Array.isArray(this.data)) {
      throw new Error(ERRS[0]())
    }

    const validationResult = this.createValidationResult(rules)
    const { type } = rules

    if (type === 'object') {
      this.validateObject(validationResult, rules)
    } else if (type === 'array') {
      // TODO: check arrayType prop in rules
    }

    return validationResult
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transform(options: TransformationOptions): any {
    return this.data
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
