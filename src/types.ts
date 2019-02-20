export type OutputType = 'array' | 'object'

type RequireMode = 'all' | 'atLeastOne' | 'default'

type ResultArray = ResultObject[] | ResultValue[]

interface ResultObject {
  [key: string]: ResultValue
}

export interface ResultValue {
  pass: boolean
  reasons: string[]
}

type Results = ResultArray | ResultObject | ResultValue

export type Rules = RulesArray | RulesObject | RulesPrimitive

export interface RulesArray extends RulesBase {
  schema: Schemas
  type: 'array'
  arrayType: 'object' | 'primitive'
}

interface RulesBase {
  options?: ValidationOptions
}

export interface RulesObject extends RulesBase {
  schema: SchemaObject
  type: 'object'
}

interface RulesPrimitive extends RulesBase {
  schema: SchemaValue
  type: 'primitive'
}

type Schemas = SchemaObject | SchemaValue

interface SchemaObject {
  [key: string]: SchemaValue
}

export interface SchemaObjectValidationResult {
  atLeastOne: boolean
  missing: string[]
  pass: boolean
  result: ResultObject
}

export interface SchemaValue {
  allowNull?: boolean
  isRequired?: boolean
  stringValidation?: StringValidation
  type?: string
}

export interface SchemaValueValidationResult {
  atLeastOne: boolean
  exitASAPTriggered: boolean
  missing: string[]
  result: ResultValue
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

export interface ValidationResult {
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  missing: string[]
  pass: boolean
  results: Results
  rules: Rules
  showFailedResults: (outputType: OutputType) => ResultValue[] | ResultObject
  showPassedResults: (outputType: OutputType) => ResultValue[] | ResultObject
}
