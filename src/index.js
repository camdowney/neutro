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
  let createdElement
  let partitionID = 0

  /**
   * Used at top-level of components to maintain state while triggering re-renders
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
  const cleanData = typeof nodeData?.tag === 'function'
    ? nodeData.tag({ self: () => createdElement, store, ...nodeData }) // is component
    : nodeData // is object

  const { c: children, ...atts } = cleanData?.constructor === Object
    ? cleanData
    : { tag: 'span', c: cleanData }
  
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