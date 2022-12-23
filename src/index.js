import createElement from './createElement.js'

// Keeps track of component data for re-rendering
let components = []

// Used by stores for data persistence
let storage = {}

// Identifies unique components
let currentID = 0

// Identifies stores within a component
let storeID = 0

/**
 * Dispatches a simple event to a target element
 * @param {Element} target Target element
 * @param {string} eventName Name of event to be dispatched
 * @returns {void}
 */
const signalEvent = (target, eventName) => {
  target.dispatchEvent(new Event(eventName))
}

/**
 * Converts node representations to actual nodes and appends output to (or replaces) target element
 * @param {Element|string} target Element (or element query) to render node(s) at
 * @param {{}|[]|Function|string} nodeData Representation of node(s) to render
 * @param {boolean} replace Replaces target with rendered node(s) if true; used for re-renders only
 * @returns {void}
 */
const render = (target, nodeData, replace) => {
  if (!target || nodeData === undefined)
    return

  const origin = typeof target === 'string' 
    ? document?.querySelector(target)
    : target

  if (typeof nodeData === 'function')
    return render(origin, { tag: nodeData }, replace)

  if (Array.isArray(nodeData))
    return nodeData.forEach(node => render(origin, node))

  if (typeof nodeData !== 'object')
    return origin.appendChild(document.createTextNode(nodeData))

  /**
   * Begin component functions; make copy of currentID since it will be incremented later
   */
  const cid = currentID

  /**
   * Used at top-level of components to maintain state while triggering re-renders; may be interacted with through the value property
   * @param {any} initialValue Initial value of store
   * @returns {{ value: any }} Store value accessor
   */
  const store = initialValue => {
    const key = cid + '-' + storeID++

    storage[key] = storage[key] ?? initialValue

    return {
      set value(newValue) {
        storage[key] = newValue
    
        currentID = cid
        render(...components[cid], true)
        currentID = components.length
      },
      get value() {
        return storage[key]
      }
    }
  }

  /**
   * Node data is confirmed Object at this point; convert to usable format
   */
  const isComponent = typeof nodeData?.tag === 'function'

  if (isComponent) 
    storeID = 0

  const cleanData = isComponent
    ? nodeData?.tag({ ref: () => components[cid][0], store, ...nodeData })
    : nodeData

  const { c: children, ...atts } = (typeof cleanData !== 'object' || Array.isArray(cleanData)) 
    ? { tag: 'span', c: cleanData }
    : cleanData
  
  /**
   * Data manipulation complete; render single element then append children
   */
  let createdElement = null

  if (replace) {
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
    components[currentID++] = [createdElement, nodeData]

  render(createdElement, children)
  signalEvent(createdElement, 'mount')
}

export default render