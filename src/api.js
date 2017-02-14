import jwt from 'jsonwebtoken'
import {JsonWebToken} from 'rheactor-models'
import Promise from 'bluebird'
import {String as StringType} from 'tcomb'

/**
 * @param {Array<String>} headers
 * @param {String} header
 * @returns {String}
 */
export function header (headers, header) {
  if (!headers || headers === null) return false
  const lowerCaseHeaders = {}
  for (const k in headers) {
    lowerCaseHeaders[k.toLowerCase()] = headers[k]
  }
  return lowerCaseHeaders[header.toLowerCase()]
}

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @param  {String} expectedContentType
 * @returns {boolean}
 */
export function checkContentType (event, expectedContentType) {
  StringType(expectedContentType, ['checkContentType', 'expectedContentType:String'])
  const ctype = header(event.headers, 'Content-Type')
  if (!ctype) {
    throw new Error('Must provide Content-Type.')
  }
  if (ctype.toLowerCase() !== expectedContentType.toLowerCase()) {
    throw new Error(`Unsupported content type: "${ctype}".`)
  }
  return true
}

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @param {String} secretOrPrivateKey
 * @returns {boolean}
 */
export function getOptionalToken (event, secretOrPrivateKey) {
  StringType(secretOrPrivateKey, ['getOptionalToken', 'secretOrPrivateKey:String'])
  const authorization = header(event.headers, 'Authorization')
  if (!authorization) return Promise.resolve()
  if (!/^Bearer /.test(authorization)) throw new Error(`Must provide bearer authorization!`)
  const token = authorization.match(/^Bearer (.+)/)[1]
  return new Promise((resolve, reject) => {
    return jwt.verify(token, secretOrPrivateKey, (error) => {
      if (error) return reject(error)
      return resolve(new JsonWebToken(token))
    })
  })
}
