const signal = (at, event) => 
  at.dispatchEvent(new Event(event))

const build = ({ r, ...props }) => {
  let effects = {}
  let listeners = {}
  let atts = {}

  Object.entries(props).forEach(([key, value]) => key.startsWith('__') ? effects[key.substring(2)] = value 
    : key.startsWith('_') ? listeners[key.substring(1)] = value : atts[key] = value)

  const newNode = document.createElement(r || 'div')
  Object.entries(atts).forEach(([att, value]) => newNode.setAttribute(att.replaceAll('_', '-'), value))

  const addEvent = listener => newNode.addEventListener(...listener)

  Object.entries(effects).forEach(effect => {
    addEvent(['mount', () => window.addEventListener(...effect)])
    addEvent(['unmount', () => window.removeEventListener(...effect)])
  })

  Object.entries(listeners).forEach(addEvent)

  return newNode
}

let storage = {}
let components = []
let currentID = 0
let storeID = 0

export const render = (at, props, replace) => {
  if (!at || props === undefined)
    return

  const origin = typeof at !== 'string' ? at : document?.querySelector(at)

  if (typeof props === 'function')
    return render(origin, { r: props }, replace)

  if (Array.isArray(props))
    return props.forEach(node => render(origin, node))

  if (typeof props !== 'object')
    return origin.innerHTML += props

  const isComponent = typeof props?.r === 'function'

  if (isComponent) 
    storeID = 0

  const nodeData = isComponent ? props?.r({ uid: '_' + currentID, ...props }) : props
  const isObject = typeof nodeData === 'object' && !Array.isArray(nodeData)
  const { c: children, ...atts } = isObject ? nodeData : { r: 'span', c: nodeData }
  
  let createdNode = null

  if (replace) {
    const parent = origin.parentNode
    const index = [...parent.children].indexOf(origin)

    signal(origin, 'unmount')
    origin.querySelectorAll('*').forEach(child => signal(child, 'unmount'))

    parent.replaceChild(build(atts), origin)
    createdNode = parent.children[index]
  }
  else {
    origin.append(build(atts))
    createdNode = origin.lastChild
  }

  if (isComponent)
    components[currentID++] = [createdNode, props]

  render(createdNode, children)

  signal(createdNode, 'mount')
}

export const store = initial => {
  const uid = currentID
  const key = `${uid}-${storeID++}`

  if (!storage[key])
    storage[key] = initial

  const setStore = value => {
    storage[key] = typeof value === 'function' ? value(storage[key]) : value

    currentID = uid
    render(...components[uid], true)
    currentID = components.length
  }

  return [storage[key], setStore]
}

export const memo = (value, dependencies = []) => {
  const key = `${currentID}-${storeID++}`

  if (!storage[key] || storage[key].dependencies.some((stored, i) => stored !== dependencies[i]))
    storage[key] = { value: value(), dependencies }

  return storage[key].value
}