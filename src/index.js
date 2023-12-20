let uid = 0

let storeValues = []
let storeIndex = 0

let subscriptions = []
let subscribeIndex = 0

const select = (root, selector) => 
  typeof selector === 'string' ? root.querySelector(selector) : root

export const c = selector => {
  const currUID = `u${uid++}`
  const _select = () => select(document, selector ?? `#${currUID}`)

  // TODO: Once html is called, outerHTML is replaced
  // and _select returns element based on old parent[parent.children.indexOf(this)]

  return {
    value: () => _select(),
    ref: () => selector ? '' : `<span id="${currUID}"></span>`,
    html: newValue => _select().innerHTML = newValue,
    select: selector => c(select(_select(), selector)),
    on: (eventName, callback) => _select().addEventListener(eventName, callback),
  }
}

export const store = initialValue => {
  const currStoreIndex = storeIndex++
  const currSubscribeIndex = subscribeIndex

  if (!storeValues[currStoreIndex])
    storeValues[currStoreIndex] = initialValue

  return {
    get val() {
      return storeValues[currStoreIndex]
    },
    set val(newValue) {
      storeValues[currStoreIndex] = newValue

      const temp = storeIndex
      storeIndex = currStoreIndex
  
      subscriptions[currSubscribeIndex].forEach(callback => callback())
  
      storeIndex = temp
  
      // TODO: remove log
      console.log(storeValues)
    },
  }
}

export const watch = callback => {
  const currSubscribeIndex = subscribeIndex++

  if (!subscriptions[currSubscribeIndex])
    subscriptions[currSubscribeIndex] = []

  const update = () => {
    const temp = subscribeIndex
    subscribeIndex = currSubscribeIndex

    callback()

    // TODO: remove killswitch
    if (storeValues[0].length > 10) document.body.innerHTML = ''

    subscribeIndex = temp
  }

  subscriptions[currSubscribeIndex].push(update)

  callback()
}