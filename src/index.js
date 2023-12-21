let cid = 0

let htmlCallbacks = []

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

export const q = selector => {
  const e = typeof selector === 'string' ? document.querySelector(selector) : selector

  const html = newValue => {
    e.innerHTML = newValue

    const prevHtmlCallbacks = Array.from(htmlCallbacks)
    htmlCallbacks = []
    
    prevHtmlCallbacks.forEach(callback => callback())
  }

  return {
    val: () => e,
    html,
    q: selector => q(e.querySelector(selector)),
    on: (eventName, callback) => e.addEventListener(eventName, callback),
  }
}

export const c = htmlCallback => {
  const currCID = cid++

  htmlCallbacks.push(() => htmlCallback(q(`#u${currCID}`)))
    
  return `<span id="u${currCID}"></span>`
}

export const store = initialValue => {
  const currStoreID = storeID++
  const currWatchID = watchID

  storeValues[currStoreID] = storeValues[currStoreID] ?? initialValue

  return {
    get val() {
      storeIdToWatchIds[currStoreID] = storeIdToWatchIds[currStoreID] ?? []

      if (!storeIdToWatchIds[currStoreID].includes(currWatchID))
        storeIdToWatchIds[currStoreID].push(currWatchID)

      return storeValues[currStoreID]
    },
    set val(newValue) {
      storeValues[currStoreID] = newValue

      const prevStoreID = storeID
      storeID = currStoreID + 1

      storeIdToWatchIds[currStoreID].forEach(id => watchCallbacks[id]())

      storeID += prevStoreID
    },
  }
}

export const watch = callback => {
  const currWatchID = watchID++

  const watchCallback = () => {
    const prevWatchID = watchID
    watchID = currWatchID + 1
    
    callback()

    watchID += prevWatchID
  }

  watchCallbacks[currWatchID] = watchCallback

  callback()
}