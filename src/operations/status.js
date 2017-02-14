import Promise from 'bluebird'
import {Status} from 'rheactor-models'

/**
 * @param {String} version
 * @param {String} environment
 * @param {String} deployTime
 * @returns {Function}
 */
export const statusOperation = (version, environment, deployTime) => ({
  post: () => Promise.resolve(new Status('ok', new Date(), `${version}+${environment}.${deployTime}`))
})
