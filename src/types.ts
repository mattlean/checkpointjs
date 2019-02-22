type RequireMode = 'all' | 'atLeastOne' | 'default'

interface ResultObject {
  [key: string]: ResultValue
}

interface ResultsArrayData extends ResultsBaseData {
  data: ResultsObjectData[] | ResultsValueData[]
  missing: number[]
}

interface ResultsBaseData {
  pass: boolean
}

interface ResultsObjectData extends ResultsBaseData {
  data: ResultObject
  missing: string[]
}

interface ResultsValueData extends ResultsBaseData {
  data: ResultValue
  missing: string[]
}

export interface ResultValue {
  pass: boolean
  reasons: string[]
}

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
  atLeastOne?: boolean
  exitASAPTriggered?: boolean
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
  atLeastOne?: boolean
  exitASAPTriggered?: boolean
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

export interface ValidationArrayResult extends ValidationBaseResult {
  data: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  results: ResultsArrayData
}

export interface ValidationBaseResult {
  pass: boolean
  rules: Rules
  showFailedResults: () => ResultValue[]
  showPassedResults: () => ResultValue[]
}

export interface ValidationObjectResult extends ValidationBaseResult {
  data: object
  results: ResultsObjectData
}
