import { c, store, watch } from '../src/index.js'

export const Counter = ({ initialCount = 0 }) => c(ref => {
  const count = store(initialCount)

  watch(() => {
    ref.html(`
      <button class='counter'>
        ${count.val}
      </button>
    `)

    ref.q('button').on('click', () => count.val++)
  })
})