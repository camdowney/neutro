let cid = 0

let renderValues = []

let storeValues = []
let storeID = 0

let watchValues = []
let watchID = 0

export const c = ref => {
  const isRenderer = typeof ref === 'function'
  const currCID = cid

  const val = () => typeof ref === 'string' ? document.querySelector(ref)
    : isRenderer ? document.querySelector(`#u${currCID}`)
    : ref

  const component = {
    val,
    html: newValue => {
      val().innerHTML = newValue()
      console.log(renderValues)
      const prevRenderValues = Array.from(renderValues)
      renderValues = []
      prevRenderValues.forEach(callback => callback())
    },
    select: selector => c(val().querySelector(selector)),
    on: (eventName, callback) => val().addEventListener(eventName, callback),
  }

  if (isRenderer) {
    cid++
    renderValues.push(() => {
      const prevCID = cid
      cid = currCID + 1

      ref(component)

      cid = prevCID
    })
    return `<span id="u${currCID}"></span>`
  }

  return component
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