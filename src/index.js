import createElement from './createElement.js'

// Tracks component data for re-rendering
let components = {}

// Tracks all store data
let storage = {}

// Tracks current store within component
let storeID = 0

// Tracks path of most recently rendered node
let currentPath = [-1]

/**
 * Helpers
 */
const signalEvent = (target, eventName) =>
  target.dispatchEvent(new Event(eventName))

/**
 * Returns the current node path as a string; for use as key
 * @returns {string} Path string
 */
const getPathString = () => 
  'r' + currentPath.join('r')

/**
 * Used at top-level of components to maintain state while triggering re-renders; may be interacted with through the value property
 * @param {any} initialValue Initial value of store
 * @returns {{ value: any }} Store value accessor
 */
const store = initialValue => {
  const path = [...currentPath]
  const key = getPathString()
  const storeKey = key + 's' + storeID++

  storage[storeKey] = storage[storeKey] ?? initialValue

  const signal = () => {
    currentPath = [...path]
    currentPath[currentPath.length - 1]--

    render(...components[key], true)
  }

  return {
    set value(newValue) {
      storage[storeKey] = newValue
      signal()
    },
    get value() {
      return storage[storeKey]
    },
    signal,
  }
}

/**
 * Converts node representations to actual nodes and appends output to (or replaces) target element
 * @param {Element|string} target Element (or element query) to render node(s) at
 * @param {{}|[]|Function|string} nodeData Representation of node(s) to render
 * @param {boolean} rerender Replaces target with rendered node(s) if true
 * @returns {void}
 */
const render = (target, nodeData, rerender) => {
  if (!target || nodeData === undefined)
    return

  const origin = typeof target === 'string' 
    ? document?.querySelector(target)
    : target

  if (typeof nodeData === 'function')
    return render(origin, { tag: nodeData }, rerender)

  if (Array.isArray(nodeData))
    return nodeData.forEach(node => render(origin, node))

  /**
   * Guards complete; register node in path
   */
  currentPath[currentPath.length - 1]++

  if (nodeData === null || nodeData === false)
    return

  if (typeof nodeData !== 'object')
    return origin.append(nodeData)

  /**
   * Node data is confirmed Object at this point; convert to usable format
   */
  const isComponent = typeof nodeData?.tag === 'function'
  const key = getPathString()

  if (isComponent) 
    storeID = 0

  const cleanData = isComponent
    ? nodeData?.tag({ ref: () => components[key][0], store, ...nodeData })
    : nodeData

  const { c: children, ...atts } = (typeof cleanData !== 'object' || Array.isArray(cleanData)) 
    ? { tag: 'span', c: cleanData }
    : cleanData
  
  /**
   * Data manipulation complete; render single element then append children
   */
  let createdElement = null

  if (rerender) {
    const parent = origin.parentNode
    const index = [...parent.children].indexOf(origin)

    signalEvent(origin, 'unmount')
    origin.querySelectorAll('*').forEach(child => signalEvent(child, 'unmount'))

    parent.replaceChild(createElement(atts), origin)
    createdElement = parent.children[index]
  }
  else {
    origin.append(createElement(atts))
    createdElement = origin.lastChild
  }

  if (isComponent)
    components[key] = [createdElement, nodeData]
  
  const copy = [...currentPath]
  currentPath.push(-1)

  render(createdElement, children)
  signalEvent(createdElement, 'mount')

  currentPath = [...copy]
}

export default render