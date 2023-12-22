import { q } from '../src/index.js'
import { Concat } from './Concat.js'
import { Counter } from './Counter.js'

/////////////////
const OuterComponent = ({ items }) => ref => {
  ref.html`
    ${items.map(item => `
      <div>
        ${InnerComponent({ item })}
      </div>
    `)}
  `
}

const InnerComponent = ({ item }) => ref => {
  ref.html`
    <div>
      ${item}
    </div>
  `
}
/////////////////

const root = q('#root')

root.html`
  <section>
    <h1>Counter</h1>
    ${[0, 1].map(n => Counter({ initialCount: n }))}
    ${Concat()}
    ${Concat()}
    ${OuterComponent({ items: ['a', 'b', 'c']})}
  </section>
`