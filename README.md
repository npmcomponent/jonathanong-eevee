*This repository is a mirror of the [component](http://component.io) module [jonathanong/eevee](http://github.com/jonathanong/eevee). It has been modified to work with NPM+Browserify. You can install it using the command `npm install npmcomponent/jonathanong-eevee`. Please do not open issues or send pull requests against this repo. If you have issues with this repo, report it to [npmcomponent](https://github.com/airportyh/npmcomponent).*
# Eevee

Event handling and delegation for modern browsers.

You might also be interested in:

- [bean](https://github.com/fat/bean)

## Notes

- Unlike other delegation libraries like jQuery,
  Eevee does not simulate event bubbling.
- If you remove elements from the document that have Eevee instances,
  you will get memory leaks since Eevee doesn't clean those up - you'll have to clean these up yourself.
  If you run into this problem,
  you're probably doing delegation wrong.
- Eevee won't support namespaced events.

## API

### event: tap

Eevee has its own `tap` based on [tap-event](https://github.com/jonathanong/tap-event).
`tap` works using delegation unlike most other libraries.
It's a little buggy, though.
Please direct any tap event issues to the [tap-event repo](https://github.com/jonathanong/tap-event)

### var e = new Eevee(HTMLElement || selector)

Creates a new instance based on an element or selector string.

### e.on(events, handler, [capture])

This is just a regular `addEventListener`.

- `events` - can be a string of events like `click tap` or an array of events like `['click', 'tap']`.
- `handler` - the event handler
- `capture` - the capture value.

```js
eevee('#link').on('click tap', function (e) {
  e.preventDefault()
  console.log('do something')
}, false)
```

### e.on(events, selector, handler)

- `events`
- `selector` - selector for the delegated element.
  Can be a single string or an array of strings.
- `handler` - the event handler
  - `this` - delegated element
  - `e` - event object

```js
eevee(document).on('click touchstart', 'button.fun', function (e) {
  console.log(this.tagName === 'BUTTON')
  console.log(this.className === 'fun')
})
```

### e.once(events, handler, [capture])

Execute a non-delegated handler once.

### e.once(events, selector, handler)

Execute a delegated handler once.

### e.off(events, handler, [capture])

Remove a non-delegated event handler.

```js
eevee('#link').off('click tap', function (e) {
  e.preventDefault()
  console.log('do something')
}, false)
```

### e.off()

Remove all delegated event handlers on the current element.
This will not removed any non-delegated event handlers.

### e.off(events)

Remove all delegated handlers attached to these events.

### e.off(events, selector)

Remove all delegated handlers attached to these events and selector.

### e.off(events, selector, handler)

You get the point.

## License

The MIT License (MIT)

Copyright (c) 2013 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.