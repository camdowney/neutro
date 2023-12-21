import { q, watch } from '../src/index.js'
import { Concat } from './Concat.js'
import { Counter } from './Counter.js'

const root = q('#root')

watch(() => {
  root.class.add('test')

  root.html`
    <section>
      <h1>Counter</h1>
      ${Concat({})}
      ${[0, 1].map(() => Counter({ }))}
      ${Concat({})}
    </section>
  `
})