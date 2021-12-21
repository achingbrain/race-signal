'use strict'

class AbortError extends Error {
  /**
   * @param {string} [message]
   * @param {string} [code]
   */
  constructor (message, code) {
    super(message || 'The operation was aborted')
    this.type = 'aborted'
    this.code = code || 'ABORT_ERR'
  }
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {AbortSignal} [signal]
 * @returns {Promise<T>}
 */
async function raceSignal (promise, signal) {
  if (!signal) {
    return promise
  }

  if (signal.aborted) {
    return Promise.reject(new AbortError('aborted'))
  }

  let listener

  try {
    return Promise.race([
      promise,
      new Promise((resolve, reject) => {
        listener = reject
        signal.addEventListener('abort', () => {
          reject(new AbortError())
        })
      })
    ])
  } finally {
    if (listener) {
      signal.removeEventListener('abort', listener)
    }
  }
}

module.exports = {
  raceSignal
}
