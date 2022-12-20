# Render
Render is a ridiculously simple and lightweight way to integrate components into your vanilla JS application. No other tools are needed—simply create component functions and render them to HTML.

## Example Stateful Component
```js
export default function Counter({ store }) {
  const count = store(0)

  return {
    tag: 'button',
    class: 'counter',
    _click: () => count.value++,
    c: { // short for "children" or "content"
      tag: 'p', 
      c: count.value
    },
  }
}
```

## Rendering to HTML
```js
import render from 'https://cdn.jsdelivr.net/gh/camdowney/render@latest/min.js'
import Counter from './components/Counter.js'

render('body', [
  { tag: 'header' },
  { tag: 'main', c: [
    { tag: 'section', class: 'counter-section', c:
      { tag: Counter }
    },
  ]},
  { tag: 'footer' },
])
```

## Adding to your project
To get started, just add the below line into your JS wherever you plan on using Render.

```js
import render from 'https://cdn.jsdelivr.net/gh/camdowney/render@latest/min.js'
```

## Documentation

### render()
The render function accepts two primary arguments: an origin and the node(s) to render. An origin may either be an element or a string that can be used to query an element. Nodes may be represented as a function, object, plain HTML, or an array containing any combination of these types.

The below code appends an empty div to the body of an HTML document.

```js
render('body', { tag: 'div' })
```

### store()
Component functions receive a custom "store" property by default. Render stores are similar to React's useState hook—they accept a default value and will trigger re-renders when modified. However, to negate the need for a separate setter function, stores return a single accessor object (inspired by SolidJS signals) for both updating and retrieving their values.

The below code creates a new store and initializes its value to 0. This value can then be accessed and updated to trigger re-renders. Note that stores must be interacted with through their "value" property.

```js
export default function Component({ store }) {
  const count = store(0)

  return {
    tag: 'button',
    _click: () => count.value++,
    c: count.value,
  }
}
```

### uid
Component functions additionally receive a UID by default. These may be used for maintaining unique components, such as by using them in query aggregation. Note that components must mount (render to HTML) before their output can be accessed through queries.

The below code allows a component to query and interact with the HTML it outputs.

```js
export default function Component({ uid }) {
  const onMount = () => {
    const renderedElement = document.querySelector('#' + uid)
    console.log(renderedElement)
  }

  return {
    tag: 'div',
    id: uid,
    _mount: onMount,
  }
}
```

### Event listeners
Event listeners may be added to elements by appending the target event name with a single underscore (_). Any standard events may be used; additionally, Render exposes two events for handling component lifecycle: "mount" and "unmount".

The below code alerts the browser when the component (an empty div) has mounted.

```js
export default function Component() {
  const onMount = () => {
    console.log('Mount complete!')
  }

  return {
    tag: 'div',
    _mount: onMount,
  }
}
```

### Window listeners
Window listeners may be managed by appending the target event name with two underscores (__). This functionality may be compared to React's useEffect hook, although window listeners in Render take care of the cleanup for you.

The below code adds an event listener to the window when it mounts. If the component unmounts (as a result of a re-render), the listener will be removed automatically before mounting again.

```js
export default function Component() {
  const onKeydown = e => {
    console.log(e.key)
  }

  return {
    tag: 'div',
    __keydown: onKeydown,
  }
}
```

## Example Implementations
* [Word Engine](https://github.com/camdowney/word-engine)