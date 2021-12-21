# race-signal <!-- omit in toc -->

> Races a promise against an AbortSignal

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Example](#example)

## Install

```console
$ npm i --save race-signal
```

## Example

```js
const { raceSignal } = require('race-signal')

const controller = new AbortController()

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('a value')
  }, 1000)
})

setTimeout(() => {
  controller.abort()
}, 500)

// throws an AbortError
const resolve = await raceSignal(promise, controller.signal)
```
