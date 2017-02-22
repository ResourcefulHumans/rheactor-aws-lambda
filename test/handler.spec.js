/* global describe, it */

import {expect} from 'chai'
import {handler, apiIndexOperation, statusOperation} from '../src'
import {HttpProblem, Status, Link, Index} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

const contentType = 'application/vnd.resourceful-humans.rheactor-aws-lambda.v1+json'
const environment = 'testing'
const tokenSecretOrPrivateKey = 'foo'
const headers = {'Content-type': contentType}
const mountURL = new URIValue('https://api.example.com/')
const operations = {
  index: apiIndexOperation(new Index([
    new Link(mountURL.append('status'), Status.$context),
    new Link(mountURL.append('empty'), Status.$context)
  ])),
  status: statusOperation('0.0.0', environment, Date.now()),
  empty: {
    post: () => undefined
  }
}

describe('index', () => {
  it('should send not found if operation does not exist', done => {
    const path = '/some/operation'
    handler(
      contentType,
      environment,
      tokenSecretOrPrivateKey,
      operations,
      {
        headers,
        path
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(404)
        expect(res.headers).to.deep.equal({
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        })
        const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#Error'), 'Unknown operation "/some/operation"', 404)
        const body = JSON.parse(res.body)
        const sentProblem = HttpProblem.fromJSON(body)
        expect(sentProblem.name).to.equal(expectedProblem.name)
        expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
        expect(sentProblem.title).to.equal(expectedProblem.title)
        expect(sentProblem.$context).to.equal(expectedProblem.$context)
        done()
      })
  })

  it('should send method not allwed if unsupported method is used', done => {
    const path = '/status'
    const httpMethod = 'DELETE'
    const body = JSON.stringify({})
    handler(
      contentType,
      environment,
      tokenSecretOrPrivateKey,
      operations,
      {
        headers,
        httpMethod,
        path,
        body
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(405)
        expect(res.headers).to.deep.equal({
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        })
        const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#Error'), 'Method not allowed: "DELETE"', 405)
        const body = JSON.parse(res.body)
        const sentProblem = HttpProblem.fromJSON(body)
        expect(sentProblem.name).to.equal(expectedProblem.name)
        expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
        expect(sentProblem.title).to.equal(expectedProblem.title)
        expect(sentProblem.$context).to.equal(expectedProblem.$context)
        done()
      })
  })

  it('should send bad request if operation does not support method', done => {
    const path = '/status'
    const httpMethod = 'GET'
    const body = JSON.stringify({})
    handler(
      contentType,
      environment,
      tokenSecretOrPrivateKey,
      operations,
      {
        headers,
        httpMethod,
        path,
        body
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(400)
        expect(res.headers).to.deep.equal({
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        })
        const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#Error'), 'Unsupported operation "GET /status"', 400)
        const body = JSON.parse(res.body)
        const sentProblem = HttpProblem.fromJSON(body)
        expect(sentProblem.name).to.equal(expectedProblem.name)
        expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
        expect(sentProblem.title).to.equal(expectedProblem.title)
        expect(sentProblem.$context).to.equal(expectedProblem.$context)
        done()
      })
  })

  it('should send bad request if bad body provided', done => {
    const path = '/status'
    const httpMethod = 'POST'
    const body = '{bad json'
    handler(
      contentType,
      environment,
      tokenSecretOrPrivateKey,
      operations,
      {
        headers,
        httpMethod,
        path,
        body
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(400)
        expect(res.headers).to.deep.equal({
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        })
        const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#SyntaxError'), '', 400)
        const body = JSON.parse(res.body)
        const sentProblem = HttpProblem.fromJSON(body)
        expect(sentProblem.name).to.equal(expectedProblem.name)
        expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
        expect(sentProblem.title).to.match(/Unexpected token b/)
        expect(sentProblem.$context).to.equal(expectedProblem.$context)
        done()
      })
  })

  it('should return HTTP 204 if no response data is created', done => {
    const path = '/empty'
    const httpMethod = 'POST'
    const body = ''
    handler(
      contentType,
      environment,
      tokenSecretOrPrivateKey,
      operations,
      {
        headers,
        httpMethod,
        path,
        body
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(204)
        done()
      })
  })
})
