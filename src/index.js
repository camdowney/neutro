let _uid = 0

let storeValues = []
let storeIndex = 0

let subscriptions = []
let subscribeIndex = 0

export const uid = () => {
  const currUID = `id="u${ _uid++}"`
  return () => currUID
}

export const on = (root, eventName, callback) => {
  root.addEventListener(eventName, callback)
}

export const children = (root, newValue) => {
  if (!newValue)
    return root.children

  root.innerHTML = newValue
}

export const select = (rootOrSelectorInit, selectorInit) => {
  const root = selectorInit ? rootOrSelectorInit : document
  const selector = selectorInit ?? rootOrSelectorInit

  const selected = typeof selector === 'function' ? root.querySelector('#' + selector().split('"')[1])
    : typeof selector === 'string' ? root.querySelector(selector)
    : selector

  return {
    value: () => selected,
    children: newValue => children(selected, newValue),
    select: selector => select(selected, selector),
    on: (eventName, callback) => on(selected, eventName, callback),
  }
}

export const store = initialValue => {
  const currStoreIndex = storeIndex++
  const currSubscribeIndex = subscribeIndex

  if (!storeValues[currStoreIndex])
    storeValues[currStoreIndex] = initialValue

  return newValue => {
    if (newValue === undefined)
      return storeValues[currStoreIndex]

    storeValues[currStoreIndex] = newValue

    const temp = storeIndex
    storeIndex = currStoreIndex

    subscriptions[currSubscribeIndex].forEach(callback => callback())

    storeIndex = temp
    console.log(storeValues)
  }
}

export const subscribe = callback => {
  const currSubscribeIndex = subscribeIndex++

  if (!subscriptions[currSubscribeIndex])
    subscriptions[currSubscribeIndex] = []

  const update = () => {
    const temp = subscribeIndex
    subscribeIndex = currSubscribeIndex

    callback()

    subscribeIndex = temp
  }

  subscriptions[currSubscribeIndex].push(update)

  callback()
}