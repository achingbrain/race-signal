/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { raceSignal } from '../src/index.js'

describe('race-signal', () => {
  it('should resolve value when no signal passed', async () => {
    const value = 'hello world'
    const p = Promise.resolve(value)

    await expect(raceSignal(p)).to.eventually.equal(value)
  })

  it('should abort when aborted signal passed', async () => {
    const reason = new Error('Wat')
    const value = 'hello world'
    const p = Promise.resolve(value)
    const controller = new AbortController()
    controller.abort(reason)

    await expect(raceSignal(p, controller.signal)).to.eventually.be.rejected()
      .equal(reason)
  })

  it('should have default error fields', async () => {
    const value = 'hello world'
    const p = Promise.resolve(value)
    const controller = new AbortController()
    controller.abort()

    const err = await raceSignal(p, controller.signal).catch(err => err)

    expect(err).to.have.property('name', 'AbortError')
  })

  it('should have override error translator', async () => {
    const reason = new Error('Wat')
    const value = 'hello world'
    const p = Promise.resolve(value)
    const controller = new AbortController()
    controller.abort(reason)

    const override = new Error('Urk!')

    const err = await raceSignal(p, controller.signal, {
      translateError: () => override
    }).catch(err => err)

    expect(err).to.equal(override)
  })

  it('should abort after a delay', async () => {
    const value = 'hello world'
    const p = new Promise((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, 1000)
    })
    const controller = new AbortController()

    setTimeout(() => {
      controller.abort()
    }, 100)

    await expect(raceSignal(p, controller.signal)).to.eventually.be.rejected()
      .with.property('name', 'AbortError')
  })

  it('should resolve after a delay', async () => {
    const value = 'hello world'
    const p = new Promise((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, 100)
    })
    const controller = new AbortController()

    setTimeout(() => {
      controller.abort()
    }, 1000)

    await expect(raceSignal(p, controller.signal)).to.eventually.equal(value)
  })

  it('should reject when an aborted signal is passed and the promise also rejects', async () => {
    const rejected = Promise.reject(new Error('wat'))
    const controller = new AbortController()
    controller.abort()

    await expect(raceSignal(rejected, controller.signal)).to.eventually.be.rejected
      .with.property('name', 'AbortError')
  })
})
