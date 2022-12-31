# Neutro
Neutro is a ridiculously simple and lightweight (<1 KB min + gzip) solution for integrating stateful components into your JS application. No other tools are needed—markup is written in object format which allows it to be modularized without the need for a transpiler.

*Currently a work-in-progress; expect bugs and breaking changes with each release.*

## Example Stateful Component
```js
export default function Counter({ store }) {
  const count = store(0)

  return {
    tag: 'button',
    class: 'counter',
    _click: () => count(count() + 1),
    c: { // short for "children" or "content"
      tag: 'p', 
      c: count()
    },
  }
}
```

## Rendering to HTML
```js
import render from 'https://cdn.jsdelivr.net/npm/neutro/min.js'
import Counter from './components/Counter.js'

render(document.body, [
  { tag: 'header' },
  { tag: 'main', c: [
    { tag: 'section', class: 'counter-section', c:
      { tag: Counter }
    },
  ] },
  { tag: 'footer' },
])
```

## Adding Neutro to Your Project
Neutro may be installed through a package manager or imported through [jsDelivr](https://www.jsdelivr.com/).

npm
```
npm i neutro
```

jsDelivr
```js
import render from 'https://cdn.jsdelivr.net/npm/neutro/min.js'
```

## Documentation
### render()
The render function accepts two primary arguments: a target element and the node(s) to render. Nodes may be represented as components (functions), objects, text content, or arrays containing any combination of these types. Note that render() should only be called once per page, at the root of where you wish to begin implementing reactive data (generally the "body" element).

The below code appends an empty div (object format) to the body of an HTML document. Note that the "tag" property may either be a standard HTML tag or a component name.

```js
render(document.body, { tag: 'div' })
```

### store()
Components receive a custom "store" property by default. Neutro stores are similar to React's useState hook—they accept a default value and will trigger re-renders when modified. However, to negate the need for a separate setter function, stores return a single accessor (inspired by [S.js](https://github.com/adamhaile/S)) for both updating and retrieving their values. Calling the accessor with no parameters will simply return the store's value, while passing in a new value will update it.

The below code creates a new store and initializes its value to 0. Incrementing this value triggers a re-render in which the UI will update automatically to show its new value.

```js
export default function Component({ store }) {
  const count = store(0)

  return {
    tag: 'button',
    _click: () => count(count() + 1),
    c: count()
  }
}
```

### self()
Components additionally receive a custom "self" property by default. Calling self() will return the component's root element upon mount, effectively allowing the component to interact with the HTML it generates. Note that self() must only be called after the component has mounted.

The below code logs the div that the component renders.

```js
export default function Component({ self }) {
  const onMount = () => {
    const renderedDiv = self()
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
Event listeners may be added to elements by appending the target event name with a single underscore (_). Any standard events may be used; additionally, Neutro exposes two events for handling component lifecycle: "mount" and "unmount".

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
Window listeners may be managed by appending the target event name with two underscores (__). This functionality overlaps a bit with how React's useEffect hook may be used, although window listeners in Neutro take care of the cleanup for you.

The below code adds a "keydown" event listener to the window upon mount. If the component unmounts (as a result of a re-render), the listener will be removed automatically before mounting again.

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

## Working with Neutro
### Rendering elements vs. components
The "tag" property dictates whether an object renders a standard element or a component. When a standard HTML tag is specified, any other properties of the object are applied directly to that element. This may include regular attributes or even event listeners. When a component is specified, however, any other properties of the object will be sent as parameters to the function of that component.

Tags may also be omitted from objects entirely, in which case a div will be rendered.

```js
  // In script
  render(document.body, {
    class: 'example-class',
    c: 'Content'
  })
```

```html
  <!-- Rendered HTML -->
  <div class="example-class">Content</div>
```

### Component return values
Components always return a single root element, even if one is not specified. Components that provide an array return value, for example, will have their output wrapped in a "span" element. Doing so allows Neutro to greatly simplify the process of handling re-renders and self() calls.

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
Just like hooks in React, Neutro stores must be used at the top level of components (never within conditions). This is because their values are preserved by their order within the component. If a store is accessed during one render but not another, the indexing of that component's stores will be offset by 1.

```js
export default function Component() {
  // Do this
  const store1 = store('value1')

  // or even this
  const store2 = exampleCondition ? store('value2a') : store('value2b')

  // but NOT this
  if (exampleCondition) {
    const store3 = store('value3')
  }

  // because if store3 doesn't activate, store4 would adopt its value.
  const store4 = store('value4')

  ...
}
```

### Rendering plain HTML
Programmatically inserting unescaped HTML onto the page can be dangerous (see [XSS](https://owasp.org/www-community/attacks/xss/)), but sometimes it's a necessity. While this should mostly be avoided, Neutro does provide an "html" property that allows you to set the innerHTML of an element.

```js
render(document.body, { 
  tag: 'script',
  html: 'console.log("With great power...")'
})
```

## Example Implementations
* [Word Engine](https://github.com/camdowney/word-engine)
