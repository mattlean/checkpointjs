import { TransformationCommand, TransformationCommands } from './types'

/**
 * Transform data
 * @param data Data to be transformed
 * @param commands Transformation command
 * @param commandOptions Transformation command options
 * @returns Transformed data
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const transform = (data: any, commands: TransformationCommand | TransformationCommands, commandOptions?: any): any => {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const c = Array.isArray(commands) ? commands : [commands]
  const d = data

  c.forEach(command => {
    if (typeof d === 'object' && !Array.isArray(d)) {
      Object.keys(d).forEach(key => {
        const currVal = d[key]

        if (command === 'clean') {
          if (currVal === undefined) delete d[key]
        } else if (command === 'replace') {
          if (Array.isArray(commandOptions) && commandOptions.length > 1) {
            if (currVal === commandOptions[0]) d[key] = commandOptions[1]
          }
        } else if (command === 'trim') {
          if (typeof currVal === 'string') d[key] = currVal.trim()
        }
      })
    }
  })

  return d
}

export default transform
