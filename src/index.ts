import { cloneDeep } from 'lodash'

import transform from './transform'
import validate from './validate'
import { Rules, TransformationCommand, TransformationCommands, ValidationResult } from './types'

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
   * Output data
   * @returns Deep cloned Checkpoint data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public output(): any {
    return cloneDeep(this.data)
  }

  /**
   * Transform Checkpoint data
   * @param commands Transformation command
   * @param commandOptions Transformation command options
   * @returns Current Checkpoint
   */
  public transform(commands: TransformationCommand | TransformationCommands): Checkpoint {
    transform(this.data, commands)
    return this
  }

  /**
   * Validate Checkpoint data
   * @param rules Rules that data is validated with
   * @returns Validation result
   */
  public validate(rules: Rules): ValidationResult {
    return validate(this.data, rules)
  }
}

/**
 * Create a checkpoint
 * @param data Data to be assigned to the checkpoint
 * @returns New Checkpoint
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkpoint = (data: any): Checkpoint => new Checkpoint(data)

export default checkpoint

export { transform, validate }
