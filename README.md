# Render
Render is a ridiculously simple way to integrate components into your vanilla JS application. No other tools are needed; simply create component functions and return their data as JSON. For state management, use the functions store() and memo(), which are analogous to React's useState and useMemo hooks.

Example Counter component:

```js
import { store } from 'https://cdn.jsdelivr.net/gh/camdowney/render/min.js'

export default function Counter() {
  const [count, setCount] = store(0)

  return {
    r: 'div', // "r" stands for "return type" and may be a tag or component function
    class: 'counter',
    _click: () => setCount(count + 1),
    c: [ // "c" stands for "children" and may be an array, component function, object, or HTML
      { r: 'p', c: count },
    ],
  }
}
```

Usage in script imported by HTML file:

```js
import { render } from 'https://cdn.jsdelivr.net/gh/camdowney/render/min.js'
import Counter from './components/Counter.js'

render('body', [
  { r: 'header' },
  { r: 'main', c: [
    { r: 'section', class: 'counter-section', c: [
      { r: Counter },
    ]},
  ]},
  { r: 'footer' },
])
```

View a more complete example implementation [here](https://github.com/camdowney/word-engine).

More documentation coming soon.
