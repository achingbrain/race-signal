/**
 * An abort error class that extends error
 */
export class AbortError extends Error {
  public type: string
  public code: string | string

  constructor (message?: string, code?: string) {
    super(message ?? 'The operation was aborted')
    this.type = 'aborted'
    this.code = code ?? 'ABORT_ERR'
  }
}

export interface RaceSignalOptions {
  /**
   * The message for the error thrown if the signal aborts
   */
  errorMessage?: string

  /**
   * The code for the error thrown if the signal aborts
   */
  errorCode?: string
}

/**
 * Race a promise against an abort signal
 */
export async function raceSignal <T> (promise: Promise<T>, signal?: AbortSignal, opts?: RaceSignalOptions): Promise<T> {
  if (signal == null) {
    return promise
  }

  if (signal.aborted) {
    return Promise.reject(new AbortError(opts?.errorMessage, opts?.errorCode))
  }

  let listener

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve, reject) => {
        listener = () => {
          reject(new AbortError(opts?.errorMessage, opts?.errorCode))
        }
        signal.addEventListener('abort', listener)
      })
    ])
  } finally {
    if (listener != null) {
      signal.removeEventListener('abort', listener)
    }
  }
}
