import { q, h, watch } from '../src/index.js'
import { Concat } from './Concat.js'
import { Counter } from './Counter.js'

/////////////////
const Test = () => ref => {
  ref.html`
    <div>
      ${['abcd'].map(row => h`
        <div>
          ${row.split('').map(char => h`
            <div>${char}</div>
          `)}
        </div>
      `)}
    </div>
  `
}
/////////////////

const root = q('#root')

watch(() => {
  root.html`
    <section>
      <h1>Counter</h1>
      ${Concat()}
      ${[0, 1].map(n => Counter({ initialCount: n }))}
      ${Concat()}
      ${Test()}
    </section>
  `
})