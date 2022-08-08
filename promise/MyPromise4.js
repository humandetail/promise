// Promise.resolve(value) 方法返回一个以给定值解析后的 Promise 对象。
// 如果这个值是一个 promise ，那么将返回这个 promise ；
// 如果这个值是 thenable（即带有 "then" 方法），
// 返回的 promise 会“跟随”这个 thenable 的对象，采用它的最终状态；
// 否则返回的 promise 将以此值完成。此函数将类 promise 对象的多层嵌套展平。

// Promise.reject 返回一个状态为 rejected 的 Promise


const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
}

const isFunction = val => typeof val === 'function'

const isObject = val => typeof val === 'object' && val !== null

const resolvePromise = (promise2, x, resolve, reject) => {
  if (promise2 === x) {
    reject(new TypeError(`Chaining cycle detected for promise #[MyPromise]`))
    return
  }

  let called = false

  // 如果 x 是一个 object 或 function
  if (isObject(x) || isFunction(x)) {
    try {
      let then = x.then

      // 如果 `then` 是一个 function，将 `x` 作为它的 `this`，
      // 第一个参数为 `resolvePromise`，第二个参数为 `rejectPromise`：
      if (isFunction(then)) {
        then.call(
          x,
          // 如果/当 `resolvePromise` 以 `y` 作为 value 调用，
          // 那么运行 `[[Resolve]](promise, y)`；
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          // 如果/当 `rejectPromise` 以 `r` 作为 reason 调用，
          // 那么 promise 的状态变为 rejected，其 reason 为 `r`；
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        // 如果 `then` 不是一个函数，
        // 那么 promise 的状态变为 fulfilled，其 value 为 `x`；
        resolve(x)
      }
    } catch (e) {
      // 如果在读取 `x.then` 时得到一个 exception `e`，
      // 那么 `promise` 的状态变成 rejected，其 reason 就是 `e`；

      // 如果调用 `then()` 时抛出了一个 exception `e`：
      // 1. 如果 `resolvePromise` 或者 `rejectPromise` 已经被调用过，直接忽略；
      // 2. 否则 promise 的状态变为 rejected，其 reason 为 e；
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

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
          }, 0)
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
          }, 0)
          break
        default:
          break
      }
    })

    // `then()` 方法必须返回一个 promise：
    return promise2
  }

  catch (onRejected) {
    return this.then(null, onRejected)
  }

  static resolve (value) {
    const promise2 = new MyPromise((resolve, reject) => {      
      setTimeout(() => {
        resolvePromise(promise2, value, resolve, reject)
      }, 0)
    })

    return promise2
  }

  static reject (reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }
}

module.exports = MyPromise
