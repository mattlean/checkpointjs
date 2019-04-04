import { TransformationCommand, TransformationCommands } from './types'

/**
 * Transform data
 * @param data Data to be transformed
 * @param commands Transformation command
 * @returns Transformed data
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const transform = (data: any, commands: TransformationCommand | TransformationCommands): any => {
  const c = Array.isArray(commands) ? commands : [commands]
  const d = data

  c.forEach(
    (command): void => {
      if (typeof d === 'object' && !Array.isArray(d)) {
        Object.keys(d).forEach(
          (key): void => {
            const currVal = d[key]

            if (
              (typeof command === 'string' && command === 'clean') ||
              (typeof command === 'object' && command.name === 'clean')
            ) {
              if (currVal === undefined) delete d[key]
            } else if (typeof command === 'object' && command.name === 'replace') {
              const { options } = command

              if (Array.isArray(options) && options.length > 1) {
                if (currVal === options[0]) d[key] = options[1]
              }
            } else if (
              (typeof command === 'string' && command === 'trim') ||
              (typeof command === 'object' && command.name === 'trim')
            ) {
              if (typeof currVal === 'string') d[key] = currVal.trim()
            }
          }
        )
      }
    }
  )

  return d
}

export default transform
