let cuid = 0

let storeValues = []
let storeID = 0

let watchValues = []
let watchID = 0

const select = (root, selector) => 
  typeof selector === 'string' ? root.querySelector(selector) : root

export const c = selector => {
  const currCUID = cuid
  if (!selector) cuid++

  const val = () => typeof selector === 'string'
    ? document.querySelector(selector)
    : (selector ?? document.querySelector(`#u${currCUID}`))

  return {
    val,
    ref: () => selector ? '' : `<span id="u${currCUID}"></span>`,
    html: newValue => val().innerHTML = newValue,
    select: selector => c(select(val(), selector)),
    on: (eventName, callback) => val().addEventListener(eventName, callback),
  }
}

export const store = initialValue => {
  const currStoreID = storeID++
  const currWatchID = watchID

  if (storeValues[currStoreID] === undefined)
    storeValues[currStoreID] = initialValue

  return {
    get val() {
      return storeValues[currStoreID]
    },
    set val(newValue) {
      storeValues[currStoreID] = newValue

      const prevStoreID = storeID
      storeID = currStoreID + 1
  
      watchValues[currWatchID].forEach(callback => callback())

      storeID = prevStoreID + storeID
    },
  }
}

export const watch = callback => {
  const currWatchID = watchID++

  const update = () => {
    const prevWatchID = watchID
    watchID = currWatchID + 1
    
    callback()

    watchID = prevWatchID + watchID
  }

  if (watchValues[currWatchID] === undefined)
    watchValues[currWatchID] = []

  watchValues[currWatchID].push(update)

  callback()
}