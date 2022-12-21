# Render
Render is a ridiculously simple and lightweight way to integrate stateful components into your vanilla JS application. No other tools are needed—markup is written in object format which allows it to be modularized and rendered directly to your HTML.

## Example Stateful Component
```js
export default function Counter({ store }) {
  const count = store(0)

  return {
    tag: 'button',
    class: 'counter',
    _click: () => count.value++,
    c: { // short for "child", "children", or "content"
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

## Adding Render to Your Project
To get started, just add the below line into your JS wherever you plan on using Render.

```js
import render from 'https://cdn.jsdelivr.net/gh/camdowney/render/min.js'
```

## Documentation
### render()
The render function accepts two primary arguments: an origin and the node(s) to render. An origin may either be an element or a string that can be used to query an element. Nodes may be represented as a function, object, plain HTML in string format, or an array containing any combination of these types.

The below code appends an empty div to the body of an HTML document. Note that the tag property may either be a standard HTML tag or a component function.

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

### ref
Component functions additionally receive a reference to their root element by default. References allow components to directly interact with the markup they generate. Note that reference values are only available after components mount (render to HTML). And just as with stores, references must be accessed through their "value" property.

The below code logs the div that is rendered when the component mounts.

```js
export default function Component({ ref }) {
  const _mount = () => {
    const renderedElement = ref.value
    console.log(renderedElement)
  }

  return {
    tag: 'div',
    _mount,
  }
}
```

### Event listeners
Event listeners may be added to elements by appending the target event name with a single underscore (_). Any standard events may be used; additionally, Render exposes two events for handling component lifecycle: "mount" and "unmount".

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
The "tag" property dictates whether an object renders a standard element or a component. When a standard HTML tag is specified, any other properties of the object are applied directly to that element. This may include regular attributes or even event listeners. When a component is specified, however, any other properties of the object will be sent as parameters to the function of that component.

Tags may also be omitted from objects entirely, in which case a div will be rendered.

```js
  // In script:
  const exampleElement = { class: 'example-class', c: 'Content' }
```

```html
  <!-- Rendered HTML: -->
  <div class='example-class'>Content</div>
```

### Component return values
Components *always* render a single root element, even if one is not specified. Dealing in single elements allows Render to greatly simplify the process of handling re-renders and references. Since the below component returns an array of elements, Render will automatically wrap its return value in a span before outputting to HTML.

```js
// In component:
return [
  { tag: 'div', c: 'Content 1' }
  { tag: 'div', c: 'Content 2' }
  { tag: 'div', c: 'Content 3' }
]
```

```html
<!-- Rendered HTML: -->
<span>
  <div>Content 1</div>
  <div>Content 2</div>
  <div>Content 3</div>
</span>
```

### Using stores
Just like hooks in React, Render stores must be used at the top level of components (never within conditions). This is because their values are preserved by their order within the component. If a store is accessed during one render but not another, the indexing of that component's stores will be offset by 1.

```js
export default function Component({ exampleCondition }) {
  // Do this...
  const store1 = store('abc')

  // ...or even this...
  const store2 = exampleCondition ? store('def') : store('ghi')

  // ...but NOT this...
  if (exampleCondition) {
    const store3 = store('jkl')
  }

  // ...because if exampleCondition ever became false, store4 would adopt store3's value.
  const store4 = store('mno')

  ...
}
```

## Example Implementations
* [Word Engine](https://github.com/camdowney/word-engine)
