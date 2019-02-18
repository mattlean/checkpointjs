export type OutputType = 'array' | 'object'

type RequireMode = 'all' | 'atLeastOne' | 'default'

interface Result {
  pass: boolean
  reasons: string[]
}

interface Results {
  [key: string]: Result
}

export type Rules = RulesArray | RulesObject | RulesPrimitive

interface RulesArray extends RulesBase {
  schema: ValidationSchema | { [key: string]: ValidationSchema }
  type: 'array'
}

interface RulesBase {
  options?: ValidationOptions
}

interface RulesObject extends RulesBase {
  schema: {
    [key: string]: ValidationSchema
  }
  type: 'object'
}

interface RulesPrimitive extends RulesBase {
  schema: 'boolean' | 'null' | 'number' | 'string' | 'undefined'
  type: 'primitive'
}

interface StringValidation {
  isDate?: boolean
  isIn?: string[]
  isLength?: {
    max?: number
    min?: number
  }
}

export interface TransformationOptions {} // eslint-disable-line @typescript-eslint/no-empty-interface

interface ValidationOptions {
  exitASAP?: boolean
  requireMode?: RequireMode
}

interface ValidationSchema {
  allowNull?: boolean
  isRequired?: boolean
  stringValidation?: StringValidation
  type?: string
}

export interface ValidationResult {
  data: object
  missing: string[]
  pass: boolean
  results: Results
  rules: Rules
  showFailedResults: (outputType: OutputType) => Result[] | Results
  showPassedResults: (outputType: OutputType) => Result[] | Results
}
