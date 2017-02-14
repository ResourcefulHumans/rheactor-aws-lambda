/* global describe, it */

import {expect} from 'chai'
import {checkContentType, getOptionalToken} from '../src'
import {JsonWebToken} from 'rheactor-models'
import jwt from 'jsonwebtoken'
import Promise from 'bluebird'
const contentType = 'application/vnd.resourceful-humans.rheactor-aws-lambda.v1+json'
const tokenSecret = 'myapikey.apiuser.apipass'

describe('api', () => {
  describe('checkContentType()', () => {
    it('should return true if correct content-type is provided', () => {
      expect(checkContentType({headers: {'Content-type': contentType}}, contentType)).to.equal(true)
    })
    it('should return true if correct content-type is provided with encoding in utf-8', () => {
      expect(checkContentType({headers: {'Content-type': `${contentType}; charset=utf-8`}}, contentType)).to.equal(true)
    })
    it('should throw an exception if a different encoding then UTF-8 is passed', () => {
      expect(() => {
        checkContentType({headers: {'Content-type': `${contentType};charset=ISO-8859-4`}}, contentType)
      }).to.throw('Unsupported encoding: "ISO-8859-4", only UTF-8 is supported.')
    })
    it('should throw an exception if no headers passed', () => {
      expect(() => {
        checkContentType({}, contentType)
      }).to.throw('Must provide Content-Type.')
    })
    it('should throw an exception if wrong content-type passed', () => {
      expect(() => {
        checkContentType({headers: {'Content-Type': 'application/json'}}, contentType)
      }).to.throw('Unsupported content type: "application/json".')
    })
  })
  describe('getOptionalToken()', () => {
    it('should return undefined if no token provided', () => {
      getOptionalToken({headers: {}}, tokenSecret)
        .then(token => expect(token).to.equal(undefined))
    })
    it('should throw and exception if Bearer Authorization is not used', () => {
      expect(() => {
        getOptionalToken({headers: {'Authorization': 'foo'}}, tokenSecret)
      }).to.throw('Must provide bearer authorization!')
    })
    it('should reject request if aninvalid token is provided', done => {
      getOptionalToken({headers: {'Authorization': 'Bearer foo'}}, tokenSecret)
        .catch(err => {
          expect(err.message).to.equal('jwt malformed')
          done()
        })
    })
    it('should accept the request if a valid token is provided', done => {
      Promise.try(() => jwt.sign(
        {
          SessionToken: 'some-session-token'
        },
        tokenSecret,
        {
          algorithm: 'HS256',
          issuer: 'login',
          subject: 'some-user-name',
          expiresIn: 60 * 60
        }))
        .then(token => getOptionalToken({headers: {'Authorization': `Bearer ${token}`}}, tokenSecret)
          .then(foundToken => {
            expect(foundToken).to.be.instanceof(JsonWebToken)
            expect(foundToken.token).to.equal(token)
            done()
          })
        )
    })
  })
})
