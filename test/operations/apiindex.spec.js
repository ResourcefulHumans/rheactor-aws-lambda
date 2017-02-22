/* global describe, it */

import {expect} from 'chai'
import {apiIndexOperation} from '../../src'
import {Status, Index} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

describe('apiindex', () => {
  it('should create a list of links', () => {
    return apiIndexOperation(new URIValue('https://api.example.com/'), {
      'status': Status.$context
    }).get()
      .then(response => {
        expect(response.$context.toString()).to.equal(Index.$context.toString())
        expect(response.$links.length).to.equal(1)
        expect(response.$links[0].href.equals(new URIValue('https://api.example.com/status'))).to.equal(true)
        expect(response.$links[0].subject.equals(Status.$context)).to.equal(true)
      })
  })
})
