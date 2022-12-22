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
        : atts[key] = value)

  const createdElement = document.createElement(tag || 'div')

  Object.entries(atts).forEach(([att, value]) => 
    createdElement.setAttribute(att.replace(/_/g, '-'), value))

  const addEvent = listener => createdElement.addEventListener(...listener)

  Object.entries(effects).forEach(effect => {
    addEvent(['mount', () => window.addEventListener(...effect)])
    addEvent(['unmount', () => window.removeEventListener(...effect)])
  })

  Object.entries(listeners).forEach(addEvent)

  return createdElement
}

export default createElement