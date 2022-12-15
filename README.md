# Render
Render is a ridiculously simple way to integrate components into your vanilla JS application. No other build tools are needed; simply create component functions and return their data as JSON. For example:

```js
import { store } from '../min.js'

export default function Counter() {
  const [count, setCount] = store(0)

  return {
    class: 'counter-outer',
    _click: () => setCount(count + 1),
    c: [
      { r: 'p', c: count },
      { r: Counter2 },
    ],
  }
}
```

Render also contains the functions store() and memo(), which are analogous to React's useState and useMemo hooks.

More documentation coming soon.