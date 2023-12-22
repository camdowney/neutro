import { q, watch } from '../src/index.js'
import { Concat } from './Concat.js'
import { Counter } from './Counter.js'

/////////////////
const Test = () => ref => {
  ref.html`
    <div>
      ${['abcd'].map(row => TestRow({ row }))}
    </div>
  `
}

const TestRow = ({ row }) => ref => {
  ref.html`
    <div>
      ${row.split('').map(char => `<div>${char}</div>`)}
    </div>
  `
}
/////////////////

const root = q('#root')

watch(() => {
  root.html`
    <section>
      <h1>Counter</h1>
      ${[0, 1].map(n => Counter({ initialCount: n }))}
      ${Concat()}
      ${Concat()}
      ${Test()}
    </section>
  `
})