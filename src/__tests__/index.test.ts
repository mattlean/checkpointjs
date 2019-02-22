import checkpoint, { Checkpoint } from '..'
import ERRS from '../errs'
import { ValidationArrayResult, ValidationObjectResult, ValidationPrimitiveResult } from '../types'

describe('Validate primitive', () => {
  it('should return passing result when passing null check', () => {
    const result = checkpoint(null).validate({
      schema: { allowNull: true },
      type: 'primitive'
    }) as ValidationPrimitiveResult
    expect(result.pass).toBe(true)
  })

  it('should return failing result when failing null check', () => {
    const result = checkpoint(null).validate({
      schema: {},
      type: 'primitive'
    }) as ValidationPrimitiveResult
    expect(result.pass).toBe(false)
    expect(result.results.data.reasons[0]).toBe(ERRS[2]('Value'))
  })

  it('should return passing result when passing required check', () => {
    const result = checkpoint('heya').validate({
      schema: { isRequired: true },
      type: 'primitive'
    }) as ValidationPrimitiveResult
    expect(result.pass).toBe(true)
  })

  it('should return failing result when failing required check', () => {
    const result = checkpoint(undefined).validate({
      schema: { isRequired: true },
      type: 'primitive'
    }) as ValidationPrimitiveResult
    expect(result.pass).toBe(false)
    expect(result.results.data.reasons[0]).toBe(ERRS[0]('Value'))
  })

  it('should return passing when passing type check', () => {
    const result = checkpoint(123).validate({
      schema: { type: 'number' },
      type: 'primitive'
    })
    expect(result.pass).toBe(true)
  })

  it('should return failing result when failing type check', () => {
    const result = checkpoint(123).validate({
      schema: { type: 'string' },
      type: 'primitive'
    }) as ValidationPrimitiveResult
    expect(result.pass).toBe(false)
    expect(result.results.data.reasons[0]).toBe(ERRS[1]('Value', 'string', 'number'))
  })
})

describe('Validate object', () => {
  it('should create a checkpoint', () => {
    const cp = checkpoint({ foo: 'bar' })
    expect(cp instanceof Checkpoint).toBe(true)
  })

  it('should return passing result if passing in empty data & constraints', () => {
    expect(checkpoint({}).validate({ schema: {}, type: 'object' }).pass).toBe(true)
  })

  it('should return failing result due to missing required data property', () => {
    const result = checkpoint({ bar: 123 }).validate({
      schema: { foo: { isRequired: true }, baz: { isRequired: true } },
      type: 'object'
    }) as ValidationObjectResult
    expect(result.data['foo']).toBe(undefined)
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[0]('foo', 'object'))
    expect(result.results.data['baz'].reasons[0]).toBe(ERRS[0]('baz', 'object'))
    expect(result.results.missing.length).toBe(2)
    expect(result.results.missing[0]).toBe('foo')
    expect(result.pass).toBe(false)
  })

  it('should return passing result for having required data property', () => {
    const result = checkpoint({ bar: 123 }).validate({
      schema: { bar: { isRequired: true } },
      type: 'object'
    }) as ValidationObjectResult
    expect(result.data['bar']).toBe(123)
    expect(result.results.data['bar'].pass).toBe(true)
    expect(result.results.data['bar'].reasons.length).toBe(0)
    expect(result.results.missing.length).toBe(0)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to data property type mismatch', () => {
    const result = checkpoint({ foo: 123 }).validate({ schema: { foo: { type: 'string' } }, type: 'object' })
    expect(typeof result.data['foo']).not.toBe('string')
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[1]('foo', 'string', 'number', 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result for having matching type', () => {
    const result = checkpoint({ foo: 123 }).validate({ schema: { foo: { type: 'number' } }, type: 'object' })
    expect(result.data['foo']).toBe(123)
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.results.data['foo'].reasons.length).toBe(0)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to data property type mismatch for null', () => {
    const result = checkpoint({ foo: 123 }).validate({ schema: { foo: { type: 'null' } }, type: 'object' })
    expect(result.data['foo']).not.toBe(null)
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[1]('foo', 'null', 'number', 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result for having matching null type', () => {
    const result = checkpoint({ foo: null }).validate({ schema: { foo: { type: 'null' } }, type: 'object' })
    expect(result.data['foo']).toBe(null)
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.results.data['foo'].reasons.length).toBe(0)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to forbidden null data property value', () => {
    const result = checkpoint({ foo: null }).validate({ schema: { foo: {} }, type: 'object' })
    expect(result.data['foo']).toBe(null)
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[2]('foo', 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result for having null data property value', () => {
    const result = checkpoint({ foo: null }).validate({ schema: { foo: { allowNull: true } }, type: 'object' })
    expect(result.data['foo']).toBe(null)
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.results.data['foo'].reasons.length).toBe(0)
    expect(result.pass).toBe(true)
  })

  it('should return passing result for having null data property value when type matching for string but also allowing null', () => {
    const result = checkpoint({ foo: null }).validate({
      schema: { foo: { allowNull: true, type: 'string' } },
      type: 'object'
    })
    expect(result.data['foo']).toBe(null)
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.results.data['foo'].reasons.length).toBe(0)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to failing 3 different constraints', () => {
    const result = checkpoint({ bar: 123, baz: null }).validate({
      schema: { foo: { isRequired: true }, bar: { type: 'string' }, baz: {} },
      type: 'object'
    })
    expect(result.data['foo']).toBe(undefined)
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[0]('foo', 'object'))
    expect(typeof result.data['bar']).not.toBe('string')
    expect(result.results.data['bar'].pass).toBe(false)
    expect(result.results.data['bar'].reasons[0]).toBe(ERRS[1]('bar', 'string', 'number', 'object'))
    expect(result.data['baz']).toBe(null)
    expect(result.results.data['baz'].pass).toBe(false)
    expect(result.results.data['baz'].reasons[0]).toBe(ERRS[2]('baz', 'object'))
    expect(result.pass).toBe(false)
  })

  it('should show failed results with showFailedResults()', () => {
    const failedResults = checkpoint({ bar: 123, baz: null })
      .validate({ schema: { foo: { isRequired: true }, bar: { type: 'string' }, baz: {} }, type: 'object' })
      .showFailedResults()
    expect(Array.isArray(failedResults)).toBe(true)
    expect(failedResults.length).toBe(3)
    expect(failedResults[0]).toBe(ERRS[0]('foo', 'object'))
    expect(failedResults[1]).toBe(ERRS[1]('bar', 'string', 'number', 'object'))
    expect(failedResults[2]).toBe(ERRS[2]('baz', 'object'))
  })

  it('should show passed results with showPassedResults()', () => {
    const passedResults = checkpoint({ bar: 123, baz: null })
      .validate({
        schema: { foo: {}, bar: { isRequired: true, type: 'number' }, baz: { allowNull: true } },
        type: 'object'
      })
      .showPassedResults()
    expect(Array.isArray(passedResults)).toBe(true)
    expect(passedResults.length).toBe(3)
    expect(passedResults[0]).toBe('foo')
    expect(passedResults[1]).toBe('bar')
    expect(passedResults[2]).toBe('baz')
  })

  it('should return multiple failed results on one key', () => {
    const result = checkpoint({ foo: null }).validate({
      schema: { foo: { allowNull: false, type: 'string' }, bar: { isRequired: true } },
      type: 'object'
    }) as ValidationObjectResult
    expect(result.data['foo']).toBe(null)
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons.length).toBe(2)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[2]('foo', 'object'))
    expect(result.results.data['foo'].reasons[1]).toBe(ERRS[1]('foo', 'string', 'null', 'object'))
    expect(result.data['bar']).toBe(undefined)
    expect(result.results.data['bar'].pass).toBe(false)
    expect(result.results.data['bar'].reasons.length).toBe(1)
    expect(result.results.data['bar'].reasons[0]).toBe(ERRS[0]('bar', 'object'))
    expect(result.results.missing.length).toBe(1)
    expect(result.results.missing[0]).toBe('bar')
    expect(result.pass).toBe(false)
  })

  it('should return only one failed result when exitASAP option is set', () => {
    const result = checkpoint({ foo: null }).validate({
      schema: { foo: { type: 'string' }, bar: { isRequired: true }, baz: { isRequired: true } },
      options: { exitASAP: true },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.showFailedResults().length).toBe(1)
    expect(result.pass).toBe(false)
  })

  it('should return failing result when requireMode is set to "all" and an data property in constraints is missing', () => {
    const result = checkpoint({ foo: null, bar: 'world' }).validate({
      schema: { foo: { allowNull: true, type: 'string' }, bar: { type: 'string' }, baz: {} },
      options: { requireMode: 'all' },
      type: 'object'
    }) as ValidationObjectResult
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.results.data['bar'].pass).toBe(true)
    expect(result.results.data['baz'].pass).toBe(false)
    expect(Object.keys(result.results.data['baz'].reasons).length).toBe(1)
    expect(result.results.data['baz'].reasons[0]).toBe(ERRS[0]('baz', 'object'))
    expect(result.results.missing.length).toBe(1)
    expect(result.results.missing[0]).toBe('baz')
    expect(result.pass).toBe(false)
  })

  it('should return passing result when requireMode is set to "all" and an data property in constraints is missing', () => {
    const result = checkpoint({ foo: null, bar: 'world', baz: 'hello' }).validate({
      schema: { foo: { allowNull: true, type: 'string' }, bar: { type: 'string' }, baz: {} },
      options: { requireMode: 'all' },
      type: 'object'
    }) as ValidationObjectResult
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.results.data['bar'].pass).toBe(true)
    expect(result.results.data['baz'].pass).toBe(true)
    expect(result.results.missing.length).toBe(0)
    expect(result.pass).toBe(true)
  })

  it('should return failing result when requireMode is set to "atLeastOne" and all data properties in constraints are missing', () => {
    const result = checkpoint({ foo: 'hello' }).validate({
      schema: { bar: { allowNull: true }, baz: {} },
      options: { requireMode: 'atLeastOne' },
      type: 'object'
    })
    expect(result.results.data['requireMode'].reasons[0]).toBe(ERRS[3]())
    expect(result.pass).toBe(false)
  })

  it('should return passing result when requireMode is set to "atLeastOne" and at least one data property in constraints is set', () => {
    const result = checkpoint({ foo: 'hello' }).validate({
      schema: { foo: {}, bar: { allowNull: true }, baz: {} },
      options: { requireMode: 'atLeastOne' },
      type: 'object'
    })
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to using non-date string when date is required', () => {
    const result = checkpoint({ foo: 'hello' }).validate({
      schema: { foo: { stringValidation: { isDate: true } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[4]('foo', 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result due to using date string when date is required', () => {
    const result = checkpoint({ foo: '2000-01-01' }).validate({
      schema: { foo: { stringValidation: { isDate: true } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to using string shorter than min length', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isLength: { min: 4 } } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[5]('foo', 4, 3, 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result due to using string longer than or equal to min length', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isLength: { min: 3 } } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to using string longer than max length', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isLength: { max: 2 } } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[6]('foo', 2, 3, 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result due to using string less than or equal to max length', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isLength: { max: 3 } } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return failing result with 2 results due to failing both min and max length constraints', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isLength: { min: 4, max: 2 } } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons.length).toBe(2)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[5]('foo', 4, 3, 'object'))
    expect(result.results.data['foo'].reasons[1]).toBe(ERRS[6]('foo', 2, 3, 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result due to passing both min and max length constraints', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isLength: { min: 2, max: 4 } } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return failing result due to failing isIn string rule', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isIn: ['ABC'] } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[7]('foo', ['ABC'], 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return failing result due to failing isIn string rule with empty array', () => {
    const result = checkpoint({ foo: '123' }).validate({
      schema: { foo: { stringValidation: { isIn: [] } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(false)
    expect(result.results.data['foo'].reasons[0]).toBe(ERRS[7]('foo', [], 'object'))
    expect(result.pass).toBe(false)
  })

  it('should return passing result due to passing isIn string rule', () => {
    const result = checkpoint({ foo: 'ABC' }).validate({
      schema: { foo: { stringValidation: { isIn: ['ABC'] } } },
      type: 'object'
    })
    expect(result.results.data['foo'].pass).toBe(true)
    expect(result.pass).toBe(true)
  })
})

describe('Validate array', () => {
  it('should return basic passing result', () => {
    const result = checkpoint([{ foo: 'ABCD' }, { foo: 'EFG' }]).validate({
      schema: { foo: { type: 'string' } },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(2)
    expect(result.results.pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return basic failing result', () => {
    const result = checkpoint([{ foo: 'ABCD' }, { foo: 123 }]).validate({
      schema: { foo: { type: 'string' } },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(2)
    expect(result.results.pass).toBe(false)
    expect(result.pass).toBe(false)
  })

  it('should return one failing result when exitASAP option is enabled', () => {
    const result = checkpoint([{ foo: 'ABCD' }, { foo: 123 }, { foo: 'EFG' }]).validate({
      schema: { foo: { type: 'string' } },
      options: { exitASAP: true },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(2)
    expect(result.results.pass).toBe(false)
    expect(result.pass).toBe(false)
  })

  it('should return failing result with missing indexes that have missing keys', () => {
    const result = checkpoint([{ foo: 'ABCD', bar: 123 }, { bar: 456 }, { foo: 'EFG' }, { foo: 'HIJK' }]).validate({
      schema: { foo: { type: 'string' }, bar: { type: 'number', isRequired: true } },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(4)
    expect(result.results.missing.length).toBe(2)
    expect(result.results.pass).toBe(false)
    expect(result.pass).toBe(false)
  })

  it('should return passing result when all required keys are included', () => {
    const result = checkpoint([
      { foo: 'ABCD', bar: 123 },
      { bar: 456 },
      { foo: 'EFG', bar: 789 },
      { foo: 'HIJK', bar: 101112 }
    ]).validate({
      schema: { foo: { type: 'string' }, bar: { type: 'number', isRequired: true } },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(4)
    expect(result.results.missing.length).toBe(0)
    expect(result.results.pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return failing result when atLeastOne condition fails', () => {
    const result = checkpoint([
      { foo: 'ABCD', bar: 123 },
      { bar: 456, baz: 'here' },
      { foo: 'EFG' },
      { foo: 'HIJK' }
    ]).validate({
      schema: { baz: { type: 'string' } },
      options: { requireMode: 'atLeastOne' },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(4)
    expect(result.results.pass).toBe(false)
    expect(result.pass).toBe(false)
  })

  it('should return passing result when atLeastOne condition passes', () => {
    const result = checkpoint([
      { foo: 'ABCD', bar: 123, baz: 'here' },
      { bar: 456, baz: 'here' },
      { foo: 'EFG', baz: 'here' },
      { foo: 'HIJK', baz: 'here' }
    ]).validate({
      schema: { baz: { type: 'string' } },
      options: { requireMode: 'atLeastOne' },
      type: 'array',
      arrayType: 'object'
    }) as ValidationArrayResult
    expect(result.results.data.length).toBe(4)
    expect(result.results.pass).toBe(true)
    expect(result.pass).toBe(true)
  })

  it('should return failed results with showFailedResults()', () => {
    const failedResults = checkpoint([
      { foo: 'ABCD', bar: 123 },
      { bar: 456 },
      { foo: 'EFG' },
      { foo: 'HIJK', bar: 'bleh' }
    ])
      .validate({
        schema: { foo: { type: 'string' }, bar: { type: 'number', isRequired: true } },
        type: 'array',
        arrayType: 'object'
      })
      .showFailedResults()
    expect(Array.isArray(failedResults)).toBe(true)
    expect(failedResults.length).toBe(2)
    expect(failedResults[0]).toBe(`[2]: ${ERRS[0]('bar', 'object')}`)
    expect(failedResults[1]).toBe(`[3]: ${ERRS[1]('bar', 'number', 'string', 'object')}`)
  })

  it('should return passed results with showPassedResults()', () => {
    const passedResults = checkpoint([
      { foo: 'ABCD', bar: 123 },
      { bar: 456 },
      { foo: 'EFG' },
      { foo: 'HIJK', bar: 'bleh' }
    ])
      .validate({
        schema: { foo: { type: 'string' }, bar: { type: 'number', isRequired: true } },
        type: 'array',
        arrayType: 'object'
      })
      .showPassedResults()
    expect(Array.isArray(passedResults)).toBe(true)
    expect(passedResults.length).toBe(6)
    expect(passedResults[0]).toBe('[0]: foo')
    expect(passedResults[1]).toBe('[0]: bar')
    expect(passedResults[2]).toBe('[1]: foo')
    expect(passedResults[3]).toBe('[1]: bar')
    expect(passedResults[4]).toBe('[2]: foo')
    expect(passedResults[5]).toBe('[3]: foo')
  })
})
