const a = (at, event) => 
  at.dispatchEvent(new Event(event))

const b = ({ r, ...props }) => {
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

let d = {}
let f = []
let g = 0
let h = 0

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
    h = 0

  const nodeData = isComponent ? props?.r({ uid: '_' + g, ...props }) : props
  const isObject = typeof nodeData === 'object' && !Array.isArray(nodeData)
  const { c: children, ...atts } = isObject ? nodeData : { r: 'span', c: nodeData }
  
  let createdNode = null

  if (replace) {
    const parent = origin.parentNode
    const index = [...parent.children].indexOf(origin)

    a(origin, 'unmount')
    origin.querySelectorAll('*').forEach(child => a(child, 'unmount'))

    parent.replaceChild(b(atts), origin)
    createdNode = parent.children[index]
  }
  else {
    origin.append(b(atts))
    createdNode = origin.lastChild
  }

  if (isComponent)
    f[g++] = [createdNode, props]

  render(createdNode, children)

  a(createdNode, 'mount')
}

export const store = initial => {
  const uid = g
  const key = `${uid}-${h++}`

  if (!d[key])
    d[key] = initial

  const setStore = value => {
    d[key] = typeof value === 'function' ? value(d[key]) : value

    g = uid
    render(...f[uid], true)
    g = f.length
  }

  return [d[key], setStore]
}

export const memo = (value, dependencies = []) => {
  const key = `${g}-${h++}`

  if (!d[key] || d[key].dependencies.some((stored, i) => stored !== dependencies[i]))
    d[key] = { value: value(), dependencies }

  return d[key].value
}