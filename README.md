# Render
Render is a ridiculously simple and lightweight (<1 KB min + gzip) solution for integrating stateful components into your JS application. No other tools are needed—markup is written in object format which allows it to be modularized without the need for a transpiler.

*Render is a work-in-progress; expect bugs and breaking changes with each release.*

## Example Stateful Component
```js
export default function Counter({ store }) {
  const count = store(0)

  return {
    tag: 'button',
    class: 'counter',
    _click: () => count.value++,
    c: { // short for 'children' or 'content'
      tag: 'p', 
      c: count.value
    },
  }
}
```

## Rendering to HTML
```js
import render from 'https://cdn.jsdelivr.net/gh/camdowney/render/min.js'
import Counter from './components/Counter.js'

render(document.body, [
  { tag: 'header' },
  { tag: 'main', c: [
    { tag: 'section', class: 'counter-section', c:
      { tag: Counter }
    },
  ]},
  { tag: 'footer' },
])
```

## Adding Render to Your Project
To get started, just add the below import wherever you plan on using Render.

```js
import render from 'https://cdn.jsdelivr.net/gh/camdowney/render/min.js'
```

## Documentation
### render()
The render function accepts two primary arguments: a target element and the node(s) to render. Nodes may be represented as components (functions), objects, text content, or arrays containing any combination of these types. Note that render() should only be called once per page, at the root of where you wish to begin implementing reactive data (generally the 'body' element).

The below code appends an empty div (object format) to the body of an HTML document. Note that the 'tag' property may either be a standard HTML tag or a component name.

```js
render(document.body, { tag: 'div' })
```

### store()
Components receive a custom 'store' property by default. Render stores are similar to React's useState hook—they accept a default value and will trigger re-renders when modified. However, to negate the need for a separate setter function, stores return a single accessor object (inspired by SolidJS signals) for both updating and retrieving their values. And for changes that do not automatically trigger re-renders (those pesky arrays!), stores contain a "signal" function that will force one.

The below code creates a new store and initializes its value to 0. This value can then be accessed and updated to trigger re-renders. Note that stores must be interacted with through their 'value' property.

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

### ref()
Components additionally receive a custom 'ref' property by default. Calling ref() will return a reference to the component's root element upon mount, effectively allowing the component to interact with the HTML it generates. Note that ref() must only be called after the component has mounted.

The below code logs the div that the component renders.

```js
export default function Component({ ref }) {
  const onMount = () => {
    const renderedDiv = ref()
    console.log(renderedDiv) // Logs: <div>Hello world!</div>
  }

  return {
    tag: 'div',
    _mount: onMount,
    c: 'Hello world!'
  }
}
```

### Event listeners
Event listeners may be added to elements by appending the target event name with a single underscore (_). Any standard events may be used; additionally, Render exposes two events for handling component lifecycle: 'mount' and 'unmount'.

The below code alerts the browser when the component has mounted.

```js
export default function Component() {
  const onMount = () => {
    alert('Mount complete!')
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

## Rules of Render
### Rendering elements vs. components
The 'tag' property dictates whether an object renders a standard element or a component. When a standard HTML tag is specified, any other properties of the object are applied directly to that element. This may include regular attributes or even event listeners. When a component is specified, however, any other properties of the object will be sent as parameters to the function of that component.

Tags may also be omitted from objects entirely, in which case a div will be rendered.

```js
  // In script
  render(document.body, { class: 'example-class', c: 'Content' })
```

```html
  <!-- Rendered HTML -->
  <div class='example-class'>Content</div>
```

### Component return values
Components may only return a single object or array, and in the latter case the array of nodes will be wrapped in a 'span'. Dealing in single elements allows Render to greatly simplify the process of handling re-renders and references.

```js
// In component
return [
  { tag: 'div', c: 'Content 1' }
  { tag: 'div', c: 'Content 2' }
  { tag: 'div', c: 'Content 3' }
]
```

```html
<!-- Rendered HTML -->
<span>
  <div>Content 1</div>
  <div>Content 2</div>
  <div>Content 3</div>
</span>
```

### Using stores
Just like hooks in React, Render stores must be used at the top level of components (never within conditions). This is because their values are preserved by their order within the component. If a store is accessed during one render but not another, the indexing of that component's stores will be offset by 1.

```js
export default function Component() {
  // Do this...
  const store1 = store('value1')

  // ...or even this...
  const store2 = exampleCondition ? store('value2a') : store('value2b')

  // ...but NOT this...
  if (exampleCondition) {
    const store3 = store('value3')
  }

  // ...because if exampleCondition ever became false, store3 wouldn't activate and store4 would adopt its value.
  const store4 = store('value4')

  ...
}
```

## Example Implementations
* [Word Engine](https://github.com/camdowney/word-engine)
