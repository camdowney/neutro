import { c, watch } from '../src/index.js'
import { str } from './util.js'

export const Concat = () => c(ref => {
  watch(() => {
    ref.html(`
      <button>${str.val}</button>
    `)

    ref.q('button').on('click', () => str.val += 'a')
  })
})