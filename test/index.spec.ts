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
    const value = 'hello world'
    const p = Promise.resolve(value)
    const controller = new AbortController()
    controller.abort()

    await expect(raceSignal(p, controller.signal)).to.eventually.be.rejected().with.property('code', 'ABORT_ERR')
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

    await expect(raceSignal(p, controller.signal)).to.eventually.be.rejected().with.property('code', 'ABORT_ERR')
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
})
