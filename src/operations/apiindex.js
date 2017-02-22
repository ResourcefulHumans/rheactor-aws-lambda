import Promise from 'bluebird'
import {IndexType} from 'rheactor-models'

/**
 * @param {Index} index
 * @return {Function}
 */
export const apiIndexOperation = (index) => {
  IndexType(index, ['apiIndexOperation()', 'index:Index'])
  return {
    get: () => Promise.resolve(index)
  }
}
