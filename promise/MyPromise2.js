// promise 必须提供一个 `then()` 方法来访问其当前或最终的 value 或 reason。

// promise 的 `then()` 方法接收两个参数：

// ```js
// promise.then(onFulfilled, onRejected)
// ```

// 1. `onFulfilled` 和 `onRejected` 都是可选参数：

//    1. 如果 `onFulfilled` 不是一个函数，会被忽略；
//    2. 如果 `onRejected` 不是一个函数，会被忽略；

// 2. 如果 `onFulfilled` 是一个函数：

//    1. 在 promise 状态变成 fulfilled 之后必须调用，并且它的第一个参数是 promise 的 value；
//    2. 在 promise 状态变成 fulfilled 之前不能被调用；
//    3. 最多只能被调用一次；

// 3. 如果 `onRejected` 是一个函数：

//    1. 在 promise 状态变成 rejected 之后必须调用，并且它的第一个参数是 promise 的 reason；
//    2. 在 promise 状态变成 rejected 之前不能被调用；
//    3. 最多只能被调用一次；

// 4. `onFulfilled` 或 `onRejected` 不能在执行上下文栈仅包含平台代码之前被调用；

// 5. `onFulfilled` 或 `onRejected` 只能当作函数被调用（i.e 没有 this，不能被当成构造函数调用）；

// 6. `then()` 方法可能会在同一个 promise 中被多次调用：

//    1. 如果/当 promise 的状态变成 fulfilled，所有相应的 `onFulfilled` 回调必须按照它们对 `then()` 的原始调用的顺序执行；
//    2. 如果/当 promise 的状态变成 rejected，所有相应的 `onRejected` 回调必须按照它们对 `then()` 的原始调用的顺序执行；

// 7. `then()` 方法必须返回一个 promise：

//    ```js
//    promise2 = promise1.then(onFulfilled, onRejected)
//    ```

//    1. 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x`，则运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`；
//    2. 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`，则 promise2 必须 rejected，并把  `e` 当作 reason；
//    3. 如果 `onFulfilled` 不是一个函数，并且 promise1 状态变成了 fulfilled，那么 promise2 的状态也需要变成 fulfilled，它的 value 和 promise1 的 value 一致；
//    4. 如果 `onRejected` 不是一个函数，并且 promise1 状态变成了 rejected，那么 promise2 的状态也需要变成 rejected，它的 reason 和 promise1 的 reason 一致。

const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
}

const isFunction = val => typeof val === 'function'

const resolvePromise = (promise2, x, resolve, reject) => {}

class MyPromise {
  status = STATUS.pending;
  value;
  reason;
  #onFulfilledCallbacks = [];
  #onRejectedCallbacks = [];

  constructor (executor) {
    if (!isFunction(executor)) {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }

    const resolve = (value) => {
      // 仅当状态为 pending 时，才能转变为 fulfilled
      if (this.status === STATUS.pending) {
        this.status = STATUS.fulfilled
        // 一个不可变的 value
        this.value = value

        // 所有相应的 `onFulfilled` 回调必须按照它们对 `then()` 的原始调用的顺序执行；
        this.#onFulfilledCallbacks.forEach(cb => cb())
      }
    }

    const reject = (reason) => {
      // 仅当状态为 pending 时，才能转变为 rejected
      if (this.status = STATUS.pending) {
        this.status = STATUS.rejected
        // 一个不可变的 reason
        this.reason = reason

        // 所有相应的 `onRejected` 回调必须按照它们对 `then()` 的原始调用的顺序执行；
        this.#onRejectedCallbacks.forEach(cb => cb())
      }
    }

    executor(resolve, reject)
  }

  then (onFulfilled, onRejected) {
    // onFullfiled 是可选参数，如果不是一个函数，将被忽略
    // 如果 `onFulfilled` 不是一个函数，并且 promise1 状态变成了 fulfilled，
    // 那么 promise2 的状态也需要变成 fulfilled，它的 value 和 promise1 的 value 一致；
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value => value)
    // onRejected 是可选参数，如果不是一个函数，将被忽略
    // 如果 `onRejected` 不是一个函数，并且 promise1 状态变成了 rejected，
    // 那么 promise2 的状态也需要变成 rejected，它的 reason 和 promise1 的 reason 一致。
    onRejected = isFunction(onRejected) ? onRejected : (reason => { throw reason })

    const promise2 = new MyPromise((resolve, reject) => {
      switch (this.status) {
        case STATUS.pending:
          // `then()` 方法可能会在同一个 promise 中被多次调用
          // 如果/当 promise 的状态变成 fulfilled，
          // 所有相应的 `onFulfilled` 回调必须按照它们对 `then()` 的原始调用的顺序执行；
          this.#onFulfilledCallbacks.push(() => {
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value)
                // 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x`，
                // 则运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`；
                resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }, 0)
          })
          // 如果/当 promise 的状态变成 rejected，
          // 所有相应的 `onRejected` 回调必须按照它们对 `then()` 的原始调用的顺序执行；
          this.#onRejectedCallbacks.push(() => {
            setTimeout(() => {
              try {
                let x = onRejected(this.reason)
                // 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x`，
                // 则运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`；
                resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                // 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`，
                // 则 promise2 必须 rejected，并把  `e` 当作 reason；
                reject(e)
              }
            }, 0)
          })
          break
        case STATUS.fulfilled:
          // onFullfilled 不能在执行上下文栈仅包含平台代码之前被调用
          setTimeout(() => {
            try {
              // 如果 onFullfilled 是一个函数
              // 在 promise 状态变成 fulfilled 之后必须调用，它的第一个参数是 value
              // 最多被调用一次
              // 只能当作函数调用
              const x = onFulfilled(this.value)
              // 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x`，
              // 则运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`；
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              // 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`，
              // 则 promise2 必须 rejected，并把  `e` 当作 reason；
              reject(e)
            }
          })
          break
        case STATUS.rejected:
          // onRejected 不能在执行上下文栈仅包含平台代码之前被调用
          setTimeout(() => {
            try {
              // 如果 onRejected 是一个函数
              // 在 promise 状态变成 rejected 之后必须调用，它的第一个参数是 reason
              // 最多被调用一次
              // 只能当作函数调用
              const x = onRejected(this.reason)
              // 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x`，
              // 则运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`；
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              // 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`，
              // 则 promise2 必须 rejected，并把  `e` 当作 reason；
              reject(e)
            }
          })
          break
        default:
          break
      }
    })

    // `then()` 方法必须返回一个 promise：
    return promise2
  }
}

module.exports = MyPromise
