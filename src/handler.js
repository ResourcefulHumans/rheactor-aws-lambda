import Promise from 'bluebird'
import {checkContentType, getOptionalToken} from './api'
import {HttpProblem} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

/**
 * @param {String} contentType
 * @param {String} environment
 * @param {String} tokenSecretOrPrivateKey
 * @param {Array.<Function>} operations
 * @param {{headers: object, path: string, httpMethod: string, body: string, queryStringParameters: object}} event
 * @param {object} context
 * @param {function} callback
 */
export function handler (contentType, environment, tokenSecretOrPrivateKey, operations, event, context, callback) {
  let statusCode = 200
  const done = (err, res) => {
    /* istanbul ignore next */
    if (err && environment !== 'testing') console.error(err)
    if (err && !(err instanceof HttpProblem)) {
      err = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#' + err.constructor.name), err.message, 400)
    }
    return callback(null, {
      statusCode: err ? err.status : (res ? statusCode : 204),
      body: JSON.stringify(err || res),
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  const allowedMethods = /^(GET|POST)$/

  Promise
    .try(() => {
      checkContentType(event, contentType)
      const parts = event.path.split('/')
      parts.shift()
      let operation = parts.shift()
      if (!operation.length || !operations[operation]) throw new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#Error'), `Unknown operation "${event.path}"`, 404)
      if (!allowedMethods.test(event.httpMethod)) {
        throw new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#Error'), `Method not allowed: "${event.httpMethod}"`, 405)
      }
      const method = event.httpMethod.toLowerCase()
      if (typeof operations[operation][method] === 'undefined') {
        throw new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#Error'), `Unsupported operation "${event.httpMethod} ${event.path}"`, 400)
      }
      const body = event.body ? JSON.parse(event.body) : {}
      return getOptionalToken(event, tokenSecretOrPrivateKey)
        .then(token => operations[operation][method](body, parts, token, event.queryStringParameters))
    })
    .then(res => done(null, res))
    .catch(err => done(err))
}
