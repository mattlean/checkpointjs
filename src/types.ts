export type OutputType = 'array' | 'object'

type RequireMode = 'all' | 'atLeastOne' | 'default'

type ResultArray = ResultObject[]

interface ResultObject {
  [key: string]: ResultProperty
}

interface ResultProperty {
  pass: boolean
  reasons: string[]
}

export type Rules = RulesArray | RulesObject | RulesPrimitive

interface RulesArray extends RulesBase {
  schema: ValidationSchema | { [key: string]: ValidationSchema }
  type: 'array'
  arrayType: 'object' | 'primitive'
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
  schema: ValidationSchema
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

export interface ValidationOptions {
  exitASAP?: boolean
  requireMode?: RequireMode
}

export interface ValidationSchema {
  allowNull?: boolean
  isRequired?: boolean
  stringValidation?: StringValidation
  type?: string
}

export interface ValidationResult {
  data: object
  missing: string[]
  pass: boolean
  results: ResultArray | ResultObject | ResultProperty
  rules: Rules
  showFailedResults: (outputType: OutputType) => ResultProperty[] | ResultObject
  showPassedResults: (outputType: OutputType) => ResultProperty[] | ResultObject
}
