import createElement from './createElement.js'

// Persists all store data
let storage = {}

// Tracks path of most recently rendered node
let currentPath = [-1]

/**
 * Dispatches a simple event to a target element
 * @param {Element} target Target element
 * @param {string} eventName Name of event
 * @returns {void}
 */
const signalEvent = (target, eventName) =>
  target.dispatchEvent(new Event(eventName))

/**
 * Converts node representations to actual nodes and appends output to (or replaces) target element
 * @param {Element} target Element to render node(s) at
 * @param {Function} component Representation of node(s) to render
 * @param {boolean} rerender Replaces target with rendered node(s) if true
 * @returns {void}
 */
export const render = (target, component, rerender) => {
  if (!target || !target.nodeType || typeof component !== 'function')
    return

  /**
   * Register node in path
   */
  currentPath[currentPath.length - 1]++

  target.innerHTML = component()

  console.log(component())

  // const idk = document.createElement('span')
  // idk.innerHTML = test
  // console.log(idk)

  // target.querySelectorAll('[as]').forEach(child => {
  //   const componentFunction = child.getAttribute('as')
  //   const props = {}

  //   Array.from(child.attributes)
  //     .filter(att => att.name !== 'as')
  //     .forEach(att => props[att.name] = att.value)

  //   child.outerHTML = componentFunction({ ...props })
  // })

  /**
   * Data manipulation complete; render single element then append children
   */
  // if (rerender) {
  //   const parent = target.parentNode
  //   const index = [...parent.children].indexOf(target)

  //   signalEvent(target, 'unmount')
  //   target.querySelectorAll('*').forEach(child => signalEvent(child, 'unmount'))

  //   parent.replaceChild(createElement(atts), target)
  //   createdElement = parent.children[index]
  // }
  // else {
  //   target.append(createElement(atts))
  //   createdElement = target.lastChild
  // }
  
  // const tempPath = currentPath.slice(0)
  // currentPath.push(-1)

  // render(createdElement, children)
  // signalEvent(createdElement, 'mount')

  // currentPath = tempPath.slice(0)
}

export function html(strings, ...values) {
  const root = document.createElement('span')

  root.innerHTML = strings.map((s, i) => s + (i < strings.length - 1 ? `%%%${i}%%%` : '')).join('')

  root.querySelectorAll('*').forEach(el => {
    const as = el.getAttribute('as')

    if (!as) return

    const value = as.replace(/%/g, '')
    const children = Array.from(el.children).map(child => child.cloneNode(true))

    /**
     * Node data is confirmed Object at this point; setup store if component
     */
    let partitionID = 0

    /**
     * 
     */
    const select = (query = '', index = 0) =>
      query === '' ? el : el.querySelectorAll(query)[index]

    /**
     * @param {any} initialValue Initial value of store
     * @returns {{ get: any }} Store value accessor
     */
    const store = initialValue => {
      const tempPath = currentPath.slice(0)
      const partitionKey = 'n' + currentPath.join('n') + 'p' + partitionID++

      storage[partitionKey] = storage[partitionKey] ?? initialValue

      return value => storage[partitionKey]
    }

    el.appendChild(values[Number(value)]({
      self: { select, store },
      ...Array.from(el.attributes).reduce((acc, att) => {
        return { ...acc, att: el.getAttribute(att) }
      }, {})
    }))

    el.removeAttribute('as')

    console.log(Array.from(el.attributes))
  })

  return root
}