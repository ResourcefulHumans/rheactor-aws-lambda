import Promise from 'bluebird'
import {URIValue, URIValueType} from 'rheactor-value-objects'
import {Object as ObjectType} from 'tcomb'
import {Link} from 'rheactor-models'

/**
 * @param {URIValue} mountURL
 * @param {object} routes
 * @return {Function}
 */
export const apiIndexOperation = (mountURL, routes) => {
  URIValueType(mountURL)
  ObjectType(routes)
  return {
    get: () => Promise.try(() => {
      const index = {
        $links: []
      }
      const u = mountURL.slashless().toString()
      for (const k in routes) {
        index.$links.push(new Link(new URIValue([u, k].join('/')), routes[k]))
      }
      return index
    })
  }
}
