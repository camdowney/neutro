let cid = 0

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

export const q = selector => {
  const ref = typeof selector === 'string' ? document.querySelector(selector) : selector

  const html = (strings, ...statements) => {
    let values = []
    let components = []
  
    strings.forEach((str, i) => {
      values.push(str)
  
      if (statements[i] === undefined) return
  
      ([statements[i]].flat().forEach(statement => {
        if (statement === undefined) return
        if (typeof statement !== 'function') return values.push(statement + '')
  
        const currCID = cid++
  
        components.push(() => statement(q(`#u${currCID}`)))
        values.push(`<div id="u${currCID}"></div>`)
      }))
    })
  
    ref.innerHTML = values.map(v => v.replace(/\s+/g, ' ')).join('')
  
    components.forEach(c => c())
  }
  
  return {
    get val() { return ref },
    get class() { return ref.classList },
    html,
    q: selector => q(ref.querySelector(selector)),
    on: (eventName, callback) => ref.addEventListener(eventName, callback),
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