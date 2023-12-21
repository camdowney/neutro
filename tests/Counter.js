import { store, watch } from '../src/index.js'

export const Counter = ({ initialCount = 0 }) => ref => {
  const count = store(initialCount)

  watch(() => {
    ref.html`
      <button class='counter'>
        ${count.val}
      </button>
    `

    ref.q('button').on('click', () => count.val++)
  })
}