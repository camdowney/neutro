import createElement from './createElement.js'

let components = {}
let storage = {}
let storeID = 0

let currentPath = [-1]

/**
 * Dispatches a simple event to a target element
 * @param {Element} target Target element
 * @param {string} eventName Name of event to be dispatched
 * @returns {void}
 */
const signalEvent = (target, eventName) => {
  target.dispatchEvent(new Event(eventName))
}

const getPathString = () =>
  '_' + currentPath.join('_')

/**
 * Used at top-level of components to maintain state while triggering re-renders; may be interacted with through the value property
 * @param {any} initialValue Initial value of store
 * @returns {{ value: any }} Store value accessor
 */
const store = initialValue => {
  const path = currentPath
  const key = getPathString() + '_' + storeID++

  storage[key] = storage[key] ?? initialValue

  const signal = () => {
    console.log(components, key)
    currentPath = path
    render(...components[key], true)
    // currentID = components.length
  }

  return {
    set value(newValue) {
      storage[key] = newValue
      signal()
    },
    get value() {
      return storage[key]
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
  const key = currentPath.join('-')

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

  console.log(createdElement, currentPath)

  if (isComponent)
    components[getPathString()] = [createdElement, nodeData]
  
  const copy = [...currentPath]
  currentPath.push(-1)

  render(createdElement, children)

  currentPath = copy

  signalEvent(createdElement, 'mount')
}

export default render