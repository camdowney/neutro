let cid = 0

let storeID = 0
let storeValues = []

let storeIdToWatchIds = []

let watchID = 0
let watchCallbacks = []

// const queryComment = (root, content) => {
//   root.childNodes.forEach(node => {
//     if (node.nodeType === Node.COMMENT_NODE)
//       return node

//     if (node && node.childNodes && node.childNodes.length > 0)
//       queryComment(node, content)
//   })
// }

export const q = selector => {
  const e = typeof selector === 'string' ? document.querySelector(selector) : selector

  // TODO: replace span ref
  const html = (strings, ...callbacks) => {
    let values = []
    let components = []

    strings.forEach((str, i) => {
      values.push(str)
      
      if (callbacks[i] === undefined) return
      if (typeof callbacks[i] !== 'function') return values.push(callbacks[i] + '')

      const currCID = cid++

      components.push(() => callbacks[i](q(`#u${currCID}`)))
      values.push(`<span id="u${currCID}"></span>`)
    })

    e.innerHTML = values.map(v => v === ' ' ? v : v.trim()).join('')

    components.forEach(c => c())
  }

  return {
    get val() { return e }, // TODO: test
    html,
    q: selector => q(e.querySelector(selector)),
    on: (eventName, callback) => e.addEventListener(eventName, callback),
  }
}

export const store = initialValue => {
  // TODO: remove
  // console.log('create store', storeID)

  const currStoreID = storeID++

  storeValues[currStoreID] = storeValues[currStoreID] ?? initialValue

  return {
    get val() {
      const currWatchID = watchID - 1

      // TODO: remove
      // console.log('get store', currStoreID, 'register watch', currWatchID)

      storeIdToWatchIds[currStoreID] = storeIdToWatchIds[currStoreID] ?? []

      if (!storeIdToWatchIds[currStoreID].includes(currWatchID))
        storeIdToWatchIds[currStoreID].push(currWatchID)

      return storeValues[currStoreID]
    },
    set val(newValue) {
      storeValues[currStoreID] = newValue

      // const prevStoreID = storeID
      storeID = currStoreID + 1

      // TODO: remove
      // console.log('set store', storeID, 'trigger watch', storeIdToWatchIds[currStoreID].join(' '))

      storeIdToWatchIds[currStoreID].forEach(id => watchCallbacks[id]())

      // storeID += prevStoreID
    },
  }
}

export const watch = callback => {
  // TODO: remove
  // console.log('create watch', watchID)

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