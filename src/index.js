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
const render = (target, component, rerender) => {
  if (!target || !target.nodeType || typeof component !== 'function')
    return

  /**
   * Register node in path
   */
  currentPath[currentPath.length - 1]++

  /**
   * Node data is confirmed Object at this point; setup store if component
   */
  let createdElement
  let partitionID = 0

  /**
   * @param {any} initialValue Initial value of store
   * @returns {{ get: any }} Store value accessor
   */
  const store = initialValue => {
    const tempPath = currentPath.slice(0)
    const partitionKey = 'n' + currentPath.join('n') + 'p' + partitionID++

    storage[partitionKey] = storage[partitionKey] ?? initialValue

    return value =>
      value === undefined
        ? storage[partitionKey]
        : (
          storage[partitionKey] = value,

          currentPath = tempPath.slice(0),
          currentPath[currentPath.length - 1]--,
    
          render(createdElement, nodeData, true)
        )
  }

  /**
   * Convert node data to usable format
   */
  
  
  /**
   * Data manipulation complete; render single element then append children
   */
  if (rerender) {
    const parent = target.parentNode
    const index = [...parent.children].indexOf(target)

    signalEvent(target, 'unmount')
    target.querySelectorAll('*').forEach(child => signalEvent(child, 'unmount'))

    parent.replaceChild(createElement(atts), target)
    createdElement = parent.children[index]
  }
  else {
    target.append(createElement(atts))
    createdElement = target.lastChild
  }
  
  const tempPath = currentPath.slice(0)
  currentPath.push(-1)

  render(createdElement, children)
  signalEvent(createdElement, 'mount')

  currentPath = tempPath.slice(0)
}

export default render

export function html(strings, ...values) {
  const root = document.createElement('span')

  root.innerHTML = strings.map((s, i) => s + (i < strings.length - 1 ? `%%%${i}%%%` : '')).join('')

  root.querySelectorAll('*').forEach(el => {
    const as = el.getAttribute('as')

    if (!as) return

    const value = as.replace(/%/g, '')
    const children = Array.from(el.children).map(child => child.cloneNode(true))

    const get = (query = '', index = 0) =>
      query === '' ? el : el.querySelectorAll(query)[index]

    el.appendChild(values[Number(value)]({
      self: {
        onMount: () => {},
        get,
      },
      ...Array.from(el.attributes).reduce((acc, att) => {
        return { ...acc, att: el.getAttribute(att) }
      }, {})
    }))

    el.removeAttribute('as')

    console.log(Array.from(el.attributes))
  })

  return root
}