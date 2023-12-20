let storeValues = []
let storeIndex = 0

let subscriptions = []
let subscribeIndex = 0

export const store = initialValue => {
  const currStoreIndex = storeIndex++
  const currSubscribeIndex = subscribeIndex

  return newValue => {
    if (newValue === undefined)
      return storeValues[currStoreIndex] ?? initialValue

    storeValues[currStoreIndex] = newValue

    subscriptions[currSubscribeIndex].forEach(callback => callback())
  }
}

export const subscribe = callback => {
  if (!subscriptions[subscribeIndex])
    subscriptions[subscribeIndex] = []

  subscriptions[subscribeIndex++].push(callback)

  callback()
}