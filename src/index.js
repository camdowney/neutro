let cid = 0

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

// export const h = (...values) => ref => ref.html(...values)

export const q = (selector, root = document) => {
  const ref = root.querySelector(selector)
  // const ref = typeof selector === 'string' ? document.querySelector(selector) : selector

  const html = (strings, ...statements) => {
    let values = [strings[0], statements.map((s, i) => [s, strings[i + 1]])].flat(Infinity)
    let cleanValues = []
    let components = []

    values.forEach(value => {
      if (value === undefined) return
      if (typeof value !== 'function') return cleanValues.push(value + '')

      const currCID = cid++

      components.push(() => value(q(`#u${currCID}`)))
      cleanValues.push(`<div id="u${currCID}"></div>`)
    })

    ref.innerHTML = cleanValues.join('')
  
    components.forEach(c => c())
  }
  
  return {
    get val() { return ref },
    get class() { return ref.classList },
    html,
    q: selector => q(selector, ref),
    // q: selector => {
    //   const e = [...ref.querySelectorAll(selector)].map(q)
    //   if (e.length === 1) return e[0]
    //   return e
    // },
    on: (eventName, callback) => ref.addEventListener(eventName, callback),
  }
}

export const store = initialValue => {
  const currStoreID = storeID++

  storeValues[currStoreID] = storeValues[currStoreID] ?? initialValue
  storeIdToWatchIds[currStoreID] = storeIdToWatchIds[currStoreID] ?? new Set()

  return {
    get val() {
      storeIdToWatchIds[currStoreID].add(watchID - 1)

      return storeValues[currStoreID]
    },
    set val(newValue) {
      storeValues[currStoreID] = newValue
      
      storeID = currStoreID + 1
      storeIdToWatchIds[currStoreID].forEach(id => watchCallbacks[id]())
    },
  }
}

export const watch = callback => {
  const currWatchID = watchID++

  watchCallbacks[currWatchID] = () => {
    watchID = currWatchID + 1
    callback()
  }

  callback()
}