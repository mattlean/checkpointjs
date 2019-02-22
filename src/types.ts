type RequireMode = 'all' | 'atLeastOne' | 'default'

interface ResultObject {
  [key: string]: ResultValue
}

interface ResultsArrayObjectData extends ResultsBaseData {
  data: ResultsObjectData[]
}

interface ResultsArrayPrimitiveData extends ResultsBaseData {
  data: ResultValue[]
}

interface ResultsBaseData {
  pass: boolean
  missing: string[]
}

interface ResultsObjectData extends ResultsBaseData {
  data: ResultObject
}

interface ResultsPrimitiveData {
  data: ResultValue
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

interface RulesObject extends RulesBase {
  schema: SchemaObject
  type: 'object'
}

interface RulesPrimitive extends RulesBase {
  schema: SchemaValue
  type: 'primitive'
}

type Schemas = SchemaObject | SchemaValue

export interface SchemaObject {
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
  missing: string | null
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

export type ValidationArrayResult = ValidationArrayObjectResult | ValidationArrayPrimitiveResult

export interface ValidationArrayObjectResult extends ValidationBaseResult {
  data: object[]
  results: ResultsArrayObjectData
}

export interface ValidationArrayPrimitiveResult extends ValidationBaseResult {
  data: boolean[] | number[] | string[] | null[]
  results: ResultsArrayPrimitiveData
}

export interface ValidationBaseResult {
  pass: boolean
  rules: Rules
  showFailedResults: () => string[]
  showPassedResults: () => string[]
}

export interface ValidationObjectResult extends ValidationBaseResult {
  data: object
  results: ResultsObjectData
}

export interface ValidationOptions {
  exitASAP?: boolean
  requireMode?: RequireMode
}

export interface ValidationPrimitiveResult extends ValidationBaseResult {
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  results: ResultsPrimitiveData
}
