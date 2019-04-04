const ERRS = {
  0: (txt: string, errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${newTxt} is required`
  },
  1: (txt: string, type: string, valType: string, errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${newTxt} only allows "${type}" type. Received "${valType}" type.`
  },
  2: (txt: string, errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${newTxt} does not allow null`
  },
  3: (): string => '"atLeastOne" require mode requires at least one to be validated',
  4: (txt: string, errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${newTxt} must be a date`
  },
  5: (txt: string, min: number, length: number, errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${txt} must be greater than or equal to ${min} characters long. Received ${length} characters.`
  },
  6: (txt: string, max: number, length: number, errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${txt} must be less than or equal to ${max} characters long. Received ${length} characters.`
  },
  7: (txt: string, isIn: string[], errType?: 'object' | 'primitive'): string => {
    let newTxt = txt
    if (errType === 'object') newTxt = `"${newTxt}" property`
    return `${txt} only allows the following values: ${isIn.join(', ')}`
  }
}

export default ERRS
