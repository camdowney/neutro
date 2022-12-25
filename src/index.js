import createElement from './createElement.js'

// Tracks all store data
let storage = {}

// Tracks current store within component
let storeID = 0

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
 * Returns the current node path as a string; for use as key
 * @returns {string} Path string
 */
const getPathString = () => 
  'n' + currentPath.join('n')

/**
 * Converts node representations to actual nodes and appends output to (or replaces) target element
 * @param {Element|string} target Element to render node(s) at
 * @param {{}|[]|Function|string} nodeData Representation of node(s) to render
 * @param {boolean} rerender Replaces target with rendered node(s) if true
 * @returns {void}
 */
const render = (target, nodeData, rerender) => {
  if (!target?.nodeType || nodeData === undefined)
    return

  if (typeof nodeData === 'function')
    return render(target, { tag: nodeData }, rerender)

  if (Array.isArray(nodeData))
    return nodeData.forEach(node => render(target, node))

  /**
   * Register node in path
   */
  currentPath[currentPath.length - 1]++

  if (nodeData === null || nodeData === false)
    return

  if (typeof nodeData !== 'object')
    return target.append(nodeData)

  /**
   * Node data is confirmed Object at this point; setup store if component
   */
  const isComponent = typeof nodeData?.tag === 'function'
  let createdElement = null

  if (isComponent) 
    storeID = 0

  /**
   * Used at top-level of components to maintain state while triggering re-renders; may be interacted with through the value property
   * @param {any} initialValue Initial value of store
   * @returns {{ value: any }} Store value accessor
   */
  const store = initialValue => {
    const tempPath = [...currentPath]
    const key = getPathString()
    const storeKey = key + 's' + storeID++

    storage[storeKey] = storage[storeKey] ?? initialValue

    const signal = () => {
      currentPath = [...tempPath]
      currentPath[currentPath.length - 1]--

      render(createdElement, nodeData, true)
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
   * Convert node data to usable format
   */
  const cleanData = isComponent
    ? nodeData.tag({ ref: () => createdElement, store, ...nodeData })
    : nodeData

  const { c: children, ...atts } = Array.isArray(cleanData)
    ? { tag: 'span', c: cleanData }
    : cleanData
  
  /**
   * Data manipulation complete; render single element then append children
   */
  if (!rerender) {
    target.append(createElement(atts))
    createdElement = target.lastChild
  }
  else {
    const parent = target.parentNode
    const index = [...parent.children].indexOf(target)

    signalEvent(target, 'unmount')
    target.querySelectorAll('*').forEach(child => signalEvent(child, 'unmount'))

    parent.replaceChild(createElement(atts), target)
    createdElement = parent.children[index]
  }
  
  const tempPath = [...currentPath]
  currentPath.push(-1)

  render(createdElement, children)
  signalEvent(createdElement, 'mount')

  currentPath = [...tempPath]
}

export default render