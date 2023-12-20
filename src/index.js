let uid = 0

let storeValues = []
let storeIndex = 0

let subscriptions = []
let subscribeIndex = 0

const select = (root, selector) => 
  typeof selector === 'string' ? root.querySelector(selector) : root

export const c = selector => {
  const cuid = uid

  const val = () => typeof selector === 'string'
    ? document.querySelector(selector)
    : (selector ?? document.querySelector(`#u${cuid}`))
  
  if (!selector) uid++

  return {
    cuid, // TODO: remove
    val,
    ref: () => selector ? '' : `<span id="u${cuid}"></span>`,
    html: newValue => val().innerHTML = newValue,
    select: selector => c(select(val(), selector)),
    on: (eventName, callback) => val().addEventListener(eventName, callback),
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

      console.log(storeValues)
  
      storeIndex = temp
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
    if (storeValues[0].length > 10 || storeValues[1] > 50 || storeValues[2] > 50)
      document.body.innerHTML = ''

    subscribeIndex = temp
  }

  subscriptions[currSubscribeIndex].push(update)

  callback()
}