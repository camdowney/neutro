let cid = 0

let renderValues = []

let storeValues = []
let storeID = 0

let watchValues = []
let watchID = 0

export const c = renderer => {
  const currCID = cid
  cid++

  renderValues.push(() => {
    const prevCID = cid
    cid = currCID + 1

    renderer(select(`#u${currCID}`))

    cid = prevCID
  })
    
  return `<span id="u${currCID}"></span>`
}

export const select = selector => {
  const e = typeof selector === 'string' ? document.querySelector(selector) : selector

  const html = newValue => {
    e.innerHTML = newValue

    const prevRenderValues = Array.from(renderValues)
    renderValues = []
    
    prevRenderValues.forEach(callback => callback())
  }

  return {
    val: () => e,
    html,
    select: selector => select(e.querySelector(selector)),
    on: (eventName, callback) => e.addEventListener(eventName, callback),
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