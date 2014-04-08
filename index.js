var matches = require('matches-selector')
var context = require('contextual-selector')
var closest = require('closest')
var query = require('query')
var tap = require('tap-event')

module.exports = Eevee

/**
 * We expose them, but they're private.
 * Only reason I can think to expose them
 * is to cleanup bad instances.
 * Don't really want to add cleanup to this repo.
 */

// [id] = [element, eevee instance]
var instances = Eevee.instances = []

// [id][event][selector] = handlers[]
var Events = Eevee.events = []

// [id][event] = EventListeners()
var Listeners = Eevee.listeners = []

// Map handlers to their `tap`d form, if any
var Taphandlers = Eevee.taphandlers = []

// el {HTMLElement|String}
function Eevee(el) {
  if (typeof el === 'string')
    el = query(el)
  if (!el)
    throw new Error('No element supplied.')

  if (!(this instanceof Eevee))
    return new Eevee(el)

  // find any
  var instance
  for (var i = 0, l = instances.length; i < l; i++)
    if ((instance = instances[i])[0] === el)
      return instance[1]

  this.element = el

  instances.push([el, this])
  Events.push(this.events = {})
  Listeners.push(this.listeners = {})
}

Eevee.prototype.on = function (events, selector, handler, capture) {
  events = getEvents(events)

  this[typeof selector === 'function' ? '_on' : '_onDelegate']
    (events, selector, handler, capture)

  return this
}

Eevee.prototype._on = function (events, handler, capture) {
  events.forEach(function (event) {
    if (event === 'tap') {
      event = 'touchstart'
      handler = getTapHandler(handler)
    }

    this.element.addEventListener(event, handler, useCapture(capture))
  }, this)
}

Eevee.prototype._onDelegate = function (events, selector, handler) {
  selector = getSelector(selector)

  getEvents(events).forEach(function (event) {
    if (event === 'tap') {
      event = 'touchstart'
      handler = getTapHandler(handler)
    }

    var selectorspace = this._addEventListener(event)

    ;(selectorspace[selector] || (selectorspace[selector] = []))
    .push(handler)
  }, this)
}

Eevee.prototype.off = function (events, selector, handler, capture) {
  this[typeof selector === 'function' ? '_off' : '_offDelegate']
    (events, selector, handler, capture)

  return this
}

Eevee.prototype._off = function (events, handler, capture) {
  capture = useCapture(capture)
  getEvents(events).forEach(function (event) {
    if (event === 'tap') {
      event = 'touchstart'
      handler = getTapHandler(handler)
    }

    this.element.removeEventListener(event, handler, capture)
  }, this)
}

Eevee.prototype._offDelegate = function (events, selector, handler) {
  // remove all delegated events
  if (!events || !selector)
    return this._removeEventListeners(events)

  events = getEvents(events)
  selector = getSelector(selector)

  var eventspace = this.events

  if (!handler) {
    // Remove all the listeners on the given selector
    events.forEach(function (event) {
      if (event === 'tap')
        event = 'touchstart'

      var selectorspace = eventspace[event]
      if (!selectorspace)
        return

      delete selectorspace[selector]

      if (!Object.keys(selectorspace).length)
        this._removeEventListeners(event)
    }, this)
  }

  events.forEach(function (event) {
    if (event === 'tap')
      event = 'touchstart'

    var selectorspace = eventspace[event]
    if (!selectorspace)
      return

    var handlers = selectorspace[selector]
    if (!handlers)
      return

    // Remove listeners, including possible duplicates
    // We do not use `[].splice` since it would mess up `once`
    handlers = handlers.filter(function (fn) {
      if (fn === handler)
        return false
      if (!fn.fn)
        return true
      if (fn.fn === handler)
        return false
      if (fn.fn.fn === handler)
        return false
      return true
    })

    // Delete the entire selector if there are no listeners
    if (!handlers.length)
      delete selectorspace[selector]
    // Replace the listeners otherwise
    else
      selectorspace[selector] = handlers
  })
}

Eevee.prototype.once = function (events, selector, handler, capture) {
  events = getEvents(events)

  this[typeof selector === 'function' ? '_once' : '_onceDelegate']
    (events, selector, handler, capture)

  return this
}

Eevee.prototype._once = function (events, handler, capture) {
  tempListener.fn = handler
  capture = useCapture(capture)

  var that = this.on(events, tempListener, capture)

  return this

  function tempListener(e) {
    handler.call(this, e)

    that.off(events, tempListener, capture)
  }
}

Eevee.prototype._onceDelegate = function (events, selector, handler) {
  tempListener.fn = handler

  var that = this.on(events, selector, tempListener)

  return this

  function tempListener(e) {
    handler.call(this, e)

    that.off(events, selector, tempListener)
  }
}

Eevee.prototype._addEventListener = function (event) {
  var listeners = this.listeners
  var eventspace = this.events
  var selectorspace = eventspace[event]

  if (listeners[event])
    return selectorspace

  selectorspace = eventspace[event] = {}

  this.element.addEventListener(
    event,
    listeners[event] = eventListener(selectorspace),
    useCapture(event)
  )

  return selectorspace
}

Eevee.prototype._removeEventListeners = function (events) {
  var listeners = this.listeners
  var element = this.element
  var eventspace = this.events

  // If events are not defined, remove them all
  ;(events ? getEvents(events) : Object.keys(eventspace))
  .forEach(function (event) {
    var listener = listeners[event]
    if (!listener)
      return

    element.removeEventListener(event, listener, useCapture(event))
    delete listeners[event]
    delete eventspace[event]
  })

  return this
}

function eventListener(selectorspace) {
  return function (e) {
    var target = e.target
    if (!target || target.nodeType !== 1) return

    Object.keys(selectorspace).forEach(function (selector) {
      // If target matches the selector, or is the descendant of an element that does, continue
      var matched

      try {
        // IE throws an error with `[]` attributes in the selector
        matched = matches(target, selector + ',' + context(selector))
      } catch (err) {
        if (console) {
          console.error(target)
          console.error(err.stack)
        }
      }

      if (!matched)
        return

      selectorspace[selector].forEach(function (fn) {
        fn.call(this, e)
      }, closest(target, selector, true, this))
    }, this)
  }
}

function getTapHandler(fn) {
  for (var i = 0; i < Taphandlers.length; i++)
    if (Taphandlers[i].fn === fn)
      return Taphandlers[i]

  var handler = tap(fn)
  Taphandlers.push(handler)
  return handler
}

/**
 * Default use capture value.
 *
 * http://www.quirksmode.org/dom/events/blurfocus.html
 */

function useCapture(event, value) {
  if (typeof value === 'boolean')
    return value

  switch (event) {
    case 'blur':
    case 'focus':
    case 'invalid':
      return true
    default:
      return false
  }
}

function getSelector(selector) {
  if (Array.isArray(selector))
    return selector.join(',')
  return selector
}

/**
 * Convert a string of events into an array of events.
 * 'click tap' -> ['click', 'tap']
 */

function getEvents(events) {
  if (Array.isArray(events))
    return events
  if (typeof events !== 'string')
    throw new TypeError('Must be a string or an array.')
  return events.trim().split(/\s+/)
}
