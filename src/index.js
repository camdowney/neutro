let cid = 0

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

export const h = (...values) => ref => ref.html(...values)

export const q = selector => {
  const ref = typeof selector === 'string' ? document.querySelector(selector) : selector

  const html = (strings, ...statements) => {
    let values = [strings[0], strings.map((_, i) => [statements[i], strings[i + 1]])].flat(Infinity)
    let cleanValues = []
    let components = []

    values.forEach(value => {
      if (value === undefined) return
      if (typeof value !== 'function') return cleanValues.push(value + '')

      const currCID = cid++

      components.push(() => value(q(`#u${currCID}`)))
      cleanValues.push(`<div id="u${currCID}"></div>`)
    })

    ref.innerHTML = cleanValues.map(v => v.replace(/\s+/g, ' ')).join('')
  
    components.forEach(c => c())
  }
  
  return {
    get val() { return ref },
    get class() { return ref.classList },
    html,
    q: selector => {
      const e = [...ref.querySelectorAll(selector)].map(q)
      if (e.length === 1) return e[0]
      return e
    },
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