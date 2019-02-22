// TODO: rename errs to be more general
const ERRS = {
  1: (txt: string) => `${txt} is required`,
  2: (txt: string, type: string, valType: string) => `${txt} only allows "${type}" type. Received "${valType}" type.`,
  3: (txt: string) => `${txt} does not allow null`,
  4: () => '"atLeastOne" require mode requires at least one to be validated',
  5: (txt: string) => `${txt} must be a date`,
  6: (txt: string, min: number, length: number) =>
    `${txt} must be greater than or equal to ${min} characters long. Received ${length} characters.`,
  7: (txt: string, max: number, length: number) =>
    `${txt} must be less than or equal to ${max} characters long. Received ${length} characters.`,
  8: (txt: string, isIn: string[]) => `${txt} only allows the following values: ${isIn.join(', ')}`
}

export default ERRS
