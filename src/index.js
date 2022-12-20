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
 * Creates an element with attribute and event listener properties as desired
 * @param {{ tag: string, ...props: any[] }} params
 * @param tag Element tag
 * @param props Element data such as attributes and listeners
 * @returns {Element} Created element
 */
const createElement = ({ tag, ...props }) => {
  let effects = {}
  let listeners = {}
  let atts = {}

  Object.entries(props).forEach(([key, value]) => 
    key.startsWith('__') 
      ? effects[key.substring(2)] = value 
      : key.startsWith('_') 
        ? listeners[key.substring(1)] = value 
        : atts[key] = value
  )

  const newNode = document.createElement(tag || 'div')

  Object.entries(atts).forEach(([att, value]) => 
    newNode.setAttribute(att.replaceAll('_', '-'), value)
  )

  const addEvent = listener => newNode.addEventListener(...listener)

  Object.entries(effects).forEach(effect => {
    addEvent(['mount', () => window.addEventListener(...effect)])
    addEvent(['unmount', () => window.removeEventListener(...effect)])
  })

  Object.entries(listeners).forEach(addEvent)

  return newNode
}

// Keeps track of component data for re-rendering
let components = []

// Used by stores for data persistence
let storage = {}

// Identifies unique components
let currentID = 0

// Identifies stores within a component
let storeID = 0

/**
 * Used at top-level of components to maintain state while triggering re-renders; may be interacted with through value property
 * @param {any} initialValue Initial value of store
 * @returns {{ value: any }} Store value accessor
 */
const store = initialValue => {
  const uid = currentID
  const key = `${uid}-${storeID++}`

  if (!storage[key])
    storage[key] = initialValue

  return {
    set value(newValue) {
      storage[key] = newValue
  
      currentID = uid
      render(...components[uid], true)
      currentID = components.length
    },
    get value() {
      return storage[key]
    }
  }
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
    return origin.innerHTML += nodeData

  // Node data is confirmed Object at this point; now convert to usable format
  const isComponent = typeof nodeData?.tag === 'function'

  if (isComponent) 
    storeID = 0

  const cleanData = isComponent
    ? nodeData?.tag({ uid: '_' + currentID, store, ...nodeData })
    : nodeData

  const isObject = typeof cleanData === 'object' && !Array.isArray(cleanData)

  const { c: children, ...atts } = isObject 
    ? cleanData
    : { tag: 'span', c: cleanData }
  
  // Data manipulation complete; render single element then append any children before mounting
  let createdNode = null

  if (replace) {
    const parent = origin.parentNode
    const index = [...parent.children].indexOf(origin)

    signalEvent(origin, 'unmount')
    origin.querySelectorAll('*').forEach(child => signalEvent(child, 'unmount'))

    parent.replaceChild(createElement(atts), origin)
    createdNode = parent.children[index]
  }
  else {
    origin.append(createElement(atts))
    createdNode = origin.lastChild
  }

  if (isComponent)
    components[currentID++] = [createdNode, nodeData]

  render(createdNode, children)
  signalEvent(createdNode, 'mount')
}

export default render