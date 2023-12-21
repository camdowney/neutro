let cid = 0

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

export const q = selector => {
  const e = typeof selector === 'string' ? document.querySelector(selector) : selector

  const html = (strings, ...statements) => {
    let values = []
    let components = []

    strings.forEach((str, i) => {
      values.push(str)
      
      if (statements[i] === undefined) return
      if (typeof statements[i] !== 'function') return values.push(statements[i] + '')

      const currCID = cid++

      components.push(() => statements[i](q(`#u${currCID}`)))
      values.push(`<div id="u${currCID}"></div>`)
    })

    e.innerHTML = values.map(v => v === ' ' ? v : v.trim()).join('')

    components.forEach(c => c())
  }

  return {
    get val() { return e },
    html,
    q: selector => q(e.querySelector(selector)),
    on: (eventName, callback) => e.addEventListener(eventName, callback),
  }
}

export const store = initialValue => {
  const currStoreID = storeID++

  storeValues[currStoreID] = storeValues[currStoreID] ?? initialValue

  return {
    get val() {
      const currWatchID = watchID - 1

      storeIdToWatchIds[currStoreID] = storeIdToWatchIds[currStoreID] ?? []

      if (!storeIdToWatchIds[currStoreID].includes(currWatchID))
        storeIdToWatchIds[currStoreID].push(currWatchID)

      return storeValues[currStoreID]
    },
    set val(newValue) {
      storeValues[currStoreID] = newValue

      // const prevStoreID = storeID
      storeID = currStoreID + 1

      storeIdToWatchIds[currStoreID].forEach(id => watchCallbacks[id]())

      // storeID += prevStoreID
    },
  }
}

export const watch = callback => {
  const currWatchID = watchID++
  
  const watchCallback = () => {
    // const prevWatchID = watchID
    watchID = currWatchID + 1
    
    callback()

    // watchID += prevWatchID
  }

  watchCallbacks[currWatchID] = watchCallback

  callback()
}