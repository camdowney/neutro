# Neutro
Neutro is a ridiculously simple and lightweight (<1 KB min + gzip) solution for integrating reactivity and components into your JS application. No transpilation, and absolutely no magic!

## Creating Reactive Components
```js
import { store, watch } from 'https://cdn.jsdelivr.net/npm/neutro/min.js'

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
```

## Using In Your App
```js
import { q } from 'https://cdn.jsdelivr.net/npm/neutro/min.js'
import { Counter } from './Counter.js'

const root = q('#root')

root.html`
  <header></header>
  <main>
    <section>
      <h1>Counter:</h1>
      ${Counter({ initialCount: 1 })}
    </section>
  </main>
  <footer></footer>
`
```

## Installation
Neutro may be installed through a package manager or imported through [jsDelivr](https://www.jsdelivr.com/).

npm
```
npm i neutro
```

jsDelivr
```js
import { q, esc, store, watch } from 'https://cdn.jsdelivr.net/npm/neutro/min.js'
```

## Documentation
### Querying elements - q()
The q function, short for 'query', accepts one argument: a selector. You can think of it as document.querySelector, except that it adds some usual functionality to its return object.

The object it returns has two getters (val and class) and three functions (html``, q(), and on()). If you haven't already guessed, you may chain q() calls as deep as you'd like.

```js
q('#root').q('#btn').on('click', () => console.log('Hi!'))
```

### Getting DOM elements - q().val
This one is pretty straightforward: calling .val on a queried element will return the corresponding HTML element in the DOM.

```js
console.log(q('#btn').val) // Logs: <button id='btn'></button>
```

### Modifying element classes - q().class
Merely a shortcut to calling .val.classList, since you are likely to use it a lot.

```js
q('#btn').class.add('btn-blue') // Becomes: <button id='btn' class='btn-blue'></button>
```

### Getting multiple queried elements - q().all()
If your query expects multiple elements to be returned, you may retrieve and iterate over them by calling .all().

```js
q('btn').all().forEach(btn => btn.on('click', () => console.log('Hi!')))
```

### Adding event listeners - q().on()
Accepts an event name and a callback in order to attach an event listener. In contrast to more sophisticated (transpiled) frameworks in which you can add event listeners directly inside markup, event listeners in Neutro must be attached after markup has been rendered.

```js
ref.html`
  <button class='counter'>
    ${count.val}
  </button>
`

ref.q('button').on('click', () => count.val++)
```

### Rendering HTML and components - q().html``
The recommended way to render markup in Neutro; and it's actually quite simple under the hood.

When you call .html`` on a queried element, it starts with replacing the element's innerHTML with whatever you pass into it. If it's just a string value, then the work is done there. However, you may also pass in functions (components) as well. When this happens, a placeholder div will be inserted instead, and then the component will receive a reference to that div. Since this relies on tagged templates, there are a few caveats, but overall it allows you to write markup similar to JSX without the need for transpilation.

As a result, components just need to return a function that accepts a reference and uses it to render the desired markup.

```js
// Somewhere in your app
import { TestComponent } from './TestComponent.js'

ref.html`
  <section>
    // This:
    ${TestComponent({ value: 'Hi world!' })}

    // Will become this (includes a wrapper div):
    <div id='...'>
      <div class='hi-world'>
        Hi world!
      </div>
    </div>
  </section>
`

// TestComponent.js
export const TestComponent = ({ value }) => ref => {
  ref.html`
    <div class='hi-world'>
      ${value}
    </div>
  `
}
```

### Escaping values - esc()
Always escape user input and anything else coming from outside your application! Neutro cannot take care of this automatically since it relies on template strings, so you will need pay close attention to this yourself.

```js
const params = new URLSearchParams(window.location.search)

ref.html`
  <input name='query' value='${esc(params.query)}'>
`

```

### Reactive values and functions - store() + watch()
This is where reactivity comes into play. Rarely do we ever want to display merely static values when rendering HTML and utilizing components. 

Stores accept an initial value and return an accessor (.val), while watches accept a callback. When you retrieve a store's value inside a watch, the watch will subscribe to any changes made to the store's value. In other words, setting the store's value will cause the watch to trigger the callback passed to it.

This mechanism allows us to avoid a massive footgun found in many frameworks: prop drilling and tossing around global state. Simply export a store and any component can access it and subscribe to its changes.

To address the obvious, reactive values and callbacks are absolutely not an original idea here (see [S.js](https://github.com/adamhaile/S)).

```js
export const count = store(0)

export const Counter = () => ref => {
  watch(() => {
    ref.html`
      <button class='counter'>
        ${count.val}
      </button>
    `

    ref.q('button').on('click', () => count.val++)
  })
}
```

## Avoiding Pitfalls
### Maps inside .html``
Remember that part of Neutro's simplicity lies in the fact that it uses tagged templates. That being said, JavaScript doesn't parse tagged templates as intuitively as you might think it does.

Mapping values inside html calls is the biggest drawback here. Maps that will lead to nested components inside tagged templates do not work. Maps must either return a tagged template that can be evaluated as a string, or another component.

```js
// ❌ This will not work:
const OuterComponent = ({ items }) => ref => {
  ref.html`
    ${items.map(item => `
      <div>
        ${InnerComponent({ item })}
      </div>
    `)}
  `
}

// ✔️ But this will:
const OuterComponent = ({ items }) => ref => {
  ref.html`
    ${items.map(item => InnerComponent({ item }))}
  `
}
```

### Wrappers everywhere...
Neutro is built around components receiving references to elements that already exist in the DOM. These references will appear as wrapper divs, and will surely be a bit annoying sometimes.

That being said, modifying how these divs are displayed is trivial, so it shouldn't result in too much headache.

```js
ref.html`
  <section>
    // This:
    ${TestComponent({ value: 'Hi world!' })}

    // Will become this:
    <div id='...' class='hi-world'>
      <p>Hi world!</p>
    </div>
  </section>
`

const TestComponent = ({ value }) => ref => {
  ref.class.add('hi-world')

  ref.html`
    <p>${value}</p>
  `
}
```

### Keep stores and watches in order
Lastly, know that stores and watches *probably* need to be kept in the same order every render cycle. This means that components with watches and stores inside them shouldn't be omitted or added in at will. This is a limitation that will likely be overcome in the future.

## Implementations
* [Word Engine](https://github.com/camdowney/word-engine)