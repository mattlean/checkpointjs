import { cloneDeep } from 'lodash'
import { isIn as validatorIsIn, toDate } from 'validator'

import ERRS from './errs'
import { OutputType, Rules, TransformationOptions, ValidationResult } from './types'

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
    key: string,
    pass: boolean,
    reason?: string
  ): ValidationResult {
    const vr = validationResult

    if (!vr.results[key]) vr.results[key] = { pass, reasons: [] }

    const result = vr.results[key]

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
    if (typeof this.data !== 'object' || Array.isArray(this.data)) {
      throw new Error(ERRS[0]())
    }

    const validationResult = this.createValidationResult(rules)

    const { schema } = rules
    const options = rules.options || {}
    let atLeastOne = false
    const schemaKeys = Object.keys(schema)
    const { requireMode } = options

    for (let i = 0; i < schemaKeys.length; i += 1) {
      const currKey = schemaKeys[i]
      const currVal = this.data[currKey]
      const { allowNull, isRequired, stringValidation, type } = schema[currKey]
      const { exitASAP } = options

      if (requireMode === 'atLeastOne') {
        if (currVal !== undefined && !atLeastOne) atLeastOne = true
      } else if ((isRequired || requireMode === 'all') && currVal === undefined) {
        // Missing required property
        Checkpoint.addResult(validationResult, currKey, false, ERRS[1](currKey))
        validationResult.missing.push(currKey)
        if (exitASAP) return validationResult
      }

      if (!allowNull && currVal === null && type !== 'null') {
        // Forbidden null
        Checkpoint.addResult(validationResult, currKey, false, ERRS[3](currKey))
        if (exitASAP) return validationResult
      }

      let currValType
      if (currVal === null) currValType = 'null'
      else currValType = typeof currVal

      if (
        type &&
        ((currVal === null && type !== 'null' && !allowNull) ||
          ((currVal || currVal === '' || currVal === false) && currValType !== type))
      ) {
        // Type mismatch
        Checkpoint.addResult(validationResult, currKey, false, ERRS[2](currKey, type, currValType))
        if (exitASAP) return validationResult
      }

      if (
        stringValidation &&
        Object.keys(stringValidation).length > 0 &&
        currValType === 'string' &&
        (type === 'string' || !type)
      ) {
        const { isDate, isIn, isLength } = stringValidation

        if (isDate) {
          if (toDate(currVal) === null) {
            Checkpoint.addResult(validationResult, currKey, false, ERRS[5](currKey))
            if (exitASAP) return validationResult
          }
        }

        if (Array.isArray(isIn)) {
          if (!validatorIsIn(currVal, isIn)) {
            Checkpoint.addResult(validationResult, currKey, false, ERRS[8](currKey, isIn))
            if (exitASAP) return validationResult
          }
        }

        if (isLength) {
          if (isLength.min && isLength.min > -1) {
            if (currVal.length < isLength.min) {
              Checkpoint.addResult(validationResult, currKey, false, ERRS[6](currKey, isLength.min, currVal.length))
              if (exitASAP) return validationResult
            }
          }

          if (isLength.max && isLength.max > -1) {
            if (currVal.length > isLength.max) {
              Checkpoint.addResult(validationResult, currKey, false, ERRS[7](currKey, isLength.max, currVal.length))
              if (exitASAP) return validationResult
            }
          }
        }
      }

      // Key value is valid
      if (!validationResult.results[currKey]) Checkpoint.addResult(validationResult, currKey, true)
    }

    if (requireMode === 'atLeastOne' && !atLeastOne) {
      validationResult.pass = false
      Checkpoint.addResult(validationResult, 'requireMode', false, ERRS[4]())
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
