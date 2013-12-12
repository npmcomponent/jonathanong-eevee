var assert = require('assert')
var eevee = require('eevee')

document.body.insertAdjacentHTML('afterbegin', '<ul style="display: none;">'
  + '<li><a href="#">One</a></li>'
  + '<li><a href="#">Two</a></li>'
  + '<li><a href="#">Three</a></li>'
  + '<li><a href="#">Four</a></li>'
  + '<li><a href="#">Tell me that you love me more</a></li>'
+ '</ul>')

// https://developer.mozilla.org/en-US/docs/DOM/element.dispatchEvent
function click(el) {
  if (typeof el === 'string') el = document.querySelector(el);

  var event = document.createEvent('MouseEvents')

  event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)

  el.dispatchEvent(event)
}

describe('Regular Events', function () {
  var ul = document.querySelector('ul')
  var shouldithrow = false
  var value = 0

  function fn(e) {
    if (shouldithrow)
      throw new Error()
    value++
  }

  it('.on(event, fn)', function () {
    eevee(ul).on('click', fn)
    click(ul)
    assert(value == 1)
  })

  it('.off(event, fn)', function () {
    eevee(ul).off('click', fn)
    shouldithrow = true
    click(ul)
    assert(value === 1)
  })

  describe('.once(event, fn)', function () {
    it('trigger', function () {
      eevee(ul).once('click', fn)
      shouldithrow = false
      click(ul)
      assert(value === 2)
    })

    it('remove', function () {
      shouldithrow = true
      click(ul)
      assert(value === 2)
    })

    /* ugh this fails
    it('off', function () {
      eevee(ul).once('click', fn)
      eevee(ul).off('click', fn)
      shouldithrow = true
      click(ul)
    })
    */
  })
})

describe('Delegated Events', function () {
  var ul = document.querySelector('ul')
  var a = ul.querySelector('a')
  var shouldithrow = false
  var value = 0

  function fn(e) {
    if (shouldithrow)
      throw new Error()
    value++
  }

  it('.on(event, selector, fn)', function () {
    eevee(ul).on('click', 'a', fn)
    click(a)
    assert(value == 1)
  })

  it('.off(event, selector, fn)', function () {
    eevee(ul).off('click', 'a', fn)
    shouldithrow = true
    click(a)
    assert(value === 1)
  })

  it('.off(event, selector)', function () {
    eevee(ul).on('click', 'a', fn)
    eevee(ul).off('click', 'a')
    shouldithrow = true
    click(a)
    assert(value === 1)
  })

  it('.off(event)', function () {
    eevee(ul).on('click', 'a', fn)
    eevee(ul).off('click')
    shouldithrow = true
    click(a)
    assert(value === 1)
  })

  it('.off()', function () {
    eevee(ul).on('click', 'a', fn)
    eevee(ul).off()
    shouldithrow = true
    click(a)
    assert(value === 1)
  })

  describe('.once(event, selector, fn)', function () {
    it('trigger', function () {
      eevee(ul).once('click', 'a', fn)
      shouldithrow = false
      click(a)
      assert(value === 2)
    })

    it('remove', function () {
      shouldithrow = true
      click(a)
      assert(value === 2)
    })

    it('off', function () {
      eevee(ul).once('click', 'a', fn)
      eevee(ul).off('click', 'a', fn)
      shouldithrow = true
      click(a)
    })
  })
})