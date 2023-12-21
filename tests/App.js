import { q, watch } from '../src/index.js'
import { Concat } from './Concat.js'
import { Counter } from './Counter.js'

const root = q('#root')

watch(() => {
  root.html`
    <section>
      <h1>Counter</h1>
      ${Concat({})}
      ${Counter({})}
      ${Counter({ initialCount: 2 })}
      ${Concat({})}
    </section>
  `
})