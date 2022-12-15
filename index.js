const signal = (at, event) => 
  at.dispatchEvent(new Event(event))

const build = ({ r, ...props }) => {
  let effects = {}
  let listeners = {}
  let atts = {}

  Object.entries(props).forEach(([key, value]) => key.startsWith('__') ? effects[key.substring(2)] = value 
    : key.startsWith('_') ? listeners[key.substring(1)] = value : atts[key] = value)

  const created = document.createElement(r || 'div')
  Object.entries(atts).forEach(([att, value]) => created.setAttribute(att.replaceAll('_', '-'), value))

  const addEvent = ([e, f]) => created.addEventListener(e, f)

  Object.entries(effects).forEach(([e, f]) => {
    addEvent(['mount', () => window.addEventListener(e, f)])
    addEvent(['unmount', () => window.removeEventListener(e, f)])
  })

  Object.entries(listeners).forEach(addEvent)

  return created
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
    return props.forEach(p => render(origin, p))

  if (typeof props !== 'object')
    return origin.innerHTML += props

  const { r, ...params } = props
  const isComponent = typeof r === 'function'

  if (isComponent) 
    storeID = 0

  const obj = isComponent ? r({ uid: '_' + currentID, ...params }) : props

  const { c: children, ...atts } = (typeof obj !== 'object' || Array.isArray(obj)) ? { r: 'span', c: obj } : obj
  let created = null

  if (replace) {
    const parent = origin.parentNode
    const index = [...parent.children].indexOf(origin)

    signal(origin, 'unmount')

    origin.querySelectorAll('*').forEach(c => signal(c, 'unmount'))
    parent.replaceChild(build(atts), origin)
    created = parent.children[index]
  }
  else {
    origin.append(build(atts))
    created = origin.lastChild
  }

  if (isComponent)
    components[currentID++] = [created, props]

  if (children !== undefined)
    render(created, children)

  signal(created, 'mount')
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

export const memo = (value, dependencies) => {
  const key = `${currentID}-${storeID++}`
  const deps = Array.isArray(dependencies) ? dependencies : []

  if (!storage[key] || storage[key].deps.some((stored, i) => stored !== deps[i]))
    storage[key] = { value: value(), deps }

  return storage[key].value
}