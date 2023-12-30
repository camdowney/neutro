let cid = 0

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

export const q = (selector, root = document) => {
  const elements = typeof selector === 'string' ? [...root.querySelectorAll(selector)] : [selector]

  const html = (strings, ...statements) => {
    let values = [strings[0], statements.map((s, i) => [s, strings[i + 1]])].flat(Infinity)
    let cleanValues = []
    let components = []

    values.forEach(value => {
      if (value === undefined) return
      if (typeof value !== 'function') return cleanValues.push((value + '').replace(/\s+/g, ' '))

      const currCID = cid++

      components.push(() => value(q(`#u${currCID}`)))
      cleanValues.push(`<div id="u${currCID}"></div>`)
    })

    elements[0].innerHTML = cleanValues.join('')
  
    components.forEach(c => c())
  }
  
  return {
    get val() { return elements[0] },
    get class() { return elements[0].classList },
    all: () => elements.map(q),
    q: selector => q(selector, elements[0]),
    on: (eventName, callback) => elements[0].addEventListener(eventName, callback),
    html,
  }
}

export const esc = str =>
  (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;').trim()

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