import { q, watch } from '../src/index.js'
import { Concat } from './Concat.js'
import { Counter } from './Counter.js'

/////////////////
const Test = () => ref => {
  console.log('render keyboard')

  ref.html`
    <div class='keyboard'>
      ${['abcd'].map(row => `
        <div class='keyboard-row'>
          ${row.split('').map(char => Inner({ char }))}
        </div>
      `)}
    </div>
  `
}

const Inner = ({ char }) => ref => {
  ref.html`${char}`
}
/////////////////

const root = q('#root')

watch(() => {
  root.html`
    <section>
      <h1>Counter</h1>
      ${Concat({})}
      ${[0, 1].map(n => Counter({ initialCount: n }))}
      ${Concat({})}
      ${Test()}
    </section>
  `
})