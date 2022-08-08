说来惭愧，Promise 出来这么久了，Promises/A+ 规范都没有好好地看过，也没有尝试过实现一个符合 Promises/A+ 规范的 Promise。

下面展示 Promises/A+ 规范相关内容，中文部分是9分靠百度，1分靠胡猜翻译形式翻译的。

## 术语

> 1. “promise” is an object or function with a `then` method whose behavior conforms to this specification.
> 2. “thenable” is an object or function that defines a `then` method.
> 3. “value” is any legal JavaScript value (including `undefined`, a thenable, or a promise).
> 4. “exception” is a value that is thrown using the `throw` statement.
> 5. “reason” is a value that indicates why a promise was rejected.

1. `promise` ：一个拥有 `then()`  方法的对象和函数，其行为符合本规范的；
2. `thenable` ：一个定义了 `then()` 方法的对象或函数；
3. `value` ：一个合法的 JavaScript 值（包括 undefined，thenable，或是一个 promise）；
4. `exception`：一个通过 `throw` 语句抛出的值；
5. `reason`：一个表示为什么 promise 被 rejected 的值。

## 要求

### 2.1 Promise 状态

>2.1 Promise states
>
>A promise must be in one of three states: pending, fulfilled, or rejected.
>
>1. When pending, a promise:
>   1. may transition to either the fulfilled or rejected state.
>
>2. When fulfilled, a promise:
>   1. must not transition to any other state.
>   2. must have a value, which must not change.
>
>3. When rejected, a promise:
>   1. must not transition to any other state.
>   2. must have a reason, which must not change.
>
>
>Here, “must not change” means immutable identity (i.e. `===`), but does not imply deep immutability.

promise 的状态必须是这三种之一：pending、fulfilled 或 rejected。

1. 当状态为 pending 时，promise：
   1. 可以转变为 fulfilled 或 rejected 状态；
2. 当状态为 fulfilled 时，promise：
   1. 不可以转变成其它状态；
   2. 必须拥有一个不可变的 value；
3. 当状态为 rejected 时，promise：
   1. 不可以转变成其它状态；
   2. 必须拥有一个不可变的 reason。

这里的 “不可变” 意味着不能改变它的值（或引用）（i.e. `===`），但并不是深度不可变（shallowReadonly）。

```js
const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
}

const isFunction = val => typeof val === 'function'

class MyPromise {
  status = STATUS.pending;
  value;
  reason;

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
      }
    }

    const reject = (reason) => {
      // 仅当状态为 pending 时，才能转变为 rejected
      if (this.status = STATUS.pending) {
        this.status = STATUS.rejected
        // 一个不可变的 reason
        this.reason = reason
      }
    }

    executor(resolve, reject)
  }
}
```

### 2.2 then() 方法

>2.2 The `then` Method
>
>A promise must provide a `then` method to access its current or eventual value or reason.
>
>A promise’s `then` method accepts two arguments:
>
>```
>promise.then(onFulfilled, onRejected)
>```
>
>1. Both `onFulfilled` and `onRejected` are optional arguments:
>
>   1. If `onFulfilled` is not a function, it must be ignored.
>   2. If `onRejected` is not a function, it must be ignored.
>
>2. If `onFulfilled` is a function:
>
>   1. it must be called after `promise` is fulfilled, with `promise`’s value as its first argument.
>   2. it must not be called before `promise` is fulfilled.
>   3. it must not be called more than once.
>
>3. If `onRejected` is a function,
>
>   1. it must be called after `promise` is rejected, with `promise`’s reason as its first argument.
>   2. it must not be called before `promise` is rejected.
>   3. it must not be called more than once.
>
>4. `onFulfilled` or `onRejected` must not be called until the [execution context](https://es5.github.io/#x10.3) stack contains only platform code. [[3.1](https://promisesaplus.com/#notes)].
>
>5. `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value). [[3.2](https://promisesaplus.com/#notes)]
>
>6. `then` may be called multiple times on the same promise.
>
>   1. If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the order of their originating calls to `then`.
>   2. If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the order of their originating calls to `then`.
>
>7. `then` must return a promise [[3.3](https://promisesaplus.com/#notes)].
>
>   ```js
>   promise2 = promise1.then(onFulfilled, onRejected);
>   ```
>
>     1. If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution Procedure `[[Resolve]](promise2, x)`.
>     1. If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected with `e` as the reason.
>     1. If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled with the same value as `promise1`.
>     1. If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected with the same reason as `promise1`.
>
>

promise 必须提供一个 `then()` 方法来访问其当前或最终的 value 或 reason。

promise 的 `then()` 方法接收两个参数：

```js
promise.then(onFulfilled, onRejected)
```

1. `onFulfilled` 和 `onRejected` 都是可选参数：

   1. 如果 `onFulfilled` 不是一个函数，会被忽略；
   2. 如果 `onRejected` 不是一个函数，会被忽略；

2. 如果 `onFulfilled` 是一个函数：

   1. 在 promise 状态变成 fulfilled 之后必须调用，并且它的第一个参数是 promise 的 value；
   2. 在 promise 状态变成 fulfilled 之前不能被调用；
   3. 最多只能被调用一次；

3. 如果 `onRejected` 是一个函数：

   1. 在 promise 状态变成 rejected 之后必须调用，并且它的第一个参数是 promise 的 reason；
   2. 在 promise 状态变成 rejected 之前不能被调用；
   3. 最多只能被调用一次；

4. `onFulfilled` 或 `onRejected` 不能在执行上下文栈仅包含平台代码之前被调用；

5. `onFulfilled` 或 `onRejected` 只能当作函数被调用（i.e 没有 this，不能被当成构造函数调用）；

6. `then()` 方法可能会在同一个 promise 中被多次调用：

   1. 如果/当 promise 的状态变成 fulfilled，所有相应的 `onFulfilled` 回调必须按照它们对 `then()` 的原始调用的顺序执行；
   2. 如果/当 promise 的状态变成 rejected，所有相应的 `onRejected` 回调必须按照它们对 `then()` 的原始调用的顺序执行；

7. `then()` 方法必须返回一个 promise：

   ```js
   promise2 = promise1.then(onFulfilled, onRejected)
   ```

   1. 如果 `onFulfilled` 或 `onRejected` 返回一个值 `x`，则运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`；
   2. 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`，则 promise2 必须 rejected，并把  `e` 当作 reason；
   3. 如果 `onFulfilled` 不是一个函数，并且 promise1 状态变成了 fulfilled，那么 promise2 的状态也需要变成 fulfilled，它的 value 和 promise1 的 value 一致；
   4. 如果 `onRejected` 不是一个函数，并且 promise1 状态变成了 rejected，那么 promise2 的状态也需要变成 rejected，它的 reason 和 promise1 的 reason 一致。

```js
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
```

### 2.3 Promise 解决程序

> The **promise resolution procedure** is an abstract operation taking as input a promise and a value, which we denote as `[[Resolve]](promise, x)`. If `x` is a thenable, it attempts to make `promise` adopt the state of `x`, under the assumption that `x` behaves at least somewhat like a promise. Otherwise, it fulfills `promise` with the value `x`.
>
> This treatment of thenables allows promise implementations to interoperate, as long as they expose a Promises/A+-compliant `then` method. It also allows Promises/A+ implementations to “assimilate” nonconformant implementations with reasonable `then` methods.
>
> To run `[[Resolve]](promise, x)`, perform the following steps:
>
> 1. If `promise` and `x` refer to the same object, reject `promise` with a `TypeError` as the reason.
> 2. If `x` is a promise, adopt its state [3.4]:
>    1. If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.
>    2. If/when `x` is fulfilled, fulfill `promise` with the same value.
>    3. If/when `x` is rejected, reject `promise` with the same reason.
> 3. Otherwise, if `x` is an object or function,
>    1. Let `then` be `x.then`. [[3.5](https://promisesaplus.com/#notes)]
>    2. If retrieving the property `x.then` results in a thrown exception `e`, reject `promise` with `e` as the reason.
>    3. If `then` is a function, call it with `x` as `this`, first argument `resolvePromise`, and second argument `rejectPromise`, where:
>       1. If/when `resolvePromise` is called with a value `y`, run `[[Resolve]](promise, y)`.
>       2. If/when `rejectPromise` is called with a reason `r`, reject `promise` with `r`.
>       3. If both `resolvePromise` and `rejectPromise` are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
>       4. If calling `then` throws an exception `e`,
>          1. If `resolvePromise` or `rejectPromise` have been called, ignore it.
>          2. Otherwise, reject `promise` with `e` as the reason.
>    4. If `then` is not a function, fulfill `promise` with `x`.
> 4. If `x` is not an object or function, fulfill `promise` with `x`.
>
> If a promise is resolved with a thenable that participates in a circular thenable chain, such that the recursive nature of `[[Resolve]](promise, thenable)` eventually causes `[[Resolve]](promise, thenable)` to be called again, following the above algorithm will lead to infinite recursion. Implementations are encouraged, but not required, to detect such recursion and reject `promise` with an informative `TypeError` as the reason. [[3.6](https://promisesaplus.com/#notes)]

**Promise 解决程序**是一个以 promise 和 value 作为输入的抽象操作，我们将它表示为 `[[Resolve]](promise, x)`。如果 `x` 是一个 thenable 或者说它的行为至少像一个 promise，那么它会尝试让将 `x` 作为 promise。否则，它会让 promise 的状态会变 fulfilled，而 x 将作为 value。

对 thenables 这种处理允许 promise 实现互操作（所谓互操作是指一种能力,使得分布的控制系统设备通过相关信息的数字交换,能够协调工作,从而达到一个共同的目标，传统上互操作是指“不同平台或编程语言之间交换和共享数据的能力），只要它们暴露一个符合 Promise/A+ 规范的 `then()` 方法。它还允许 Promise/A+ 实现合理的 `then()` 方法 “吸收（同化）” 不符合要求的实现。

执行 `[[Resolve]](promise, x)` 会有以下几个步骤：

1. 如果 `promise` 和 `x` 是同一个对象，那么 `promise` 的状态会变成 rejected，并且使用一个 `TypeError` 作为 reason；
2. 如果 `x` 是一个 promise，那么：
   1. 如果 `x` 的状态是 pending，那么 `promise` 在变成 fulfilled 或 rejected 状态之前都保持为 pending；
   2. 如果/当 `x` 的状态是 fulfilled，那么 `promise` 的状态变成 fulfilled，并且使用同一个 value；
   3. 如果/当 `x` 的状态是 rejected，那么 `promise` 的状态变成 rejected，并且使用同一个 reason；
3. 否则，如果 `x` 是一个 object 或 function，那么：
   1. 将 `x.then` 赋值给 `then`；
   2. 如果在读取 `x.then` 时得到一个 exception `e`，那么 `promise` 的状态变成 rejected，其 reason 就是 `e`；
   3. 如果 `then` 是一个 function，将 `x` 作为它的 `this`，第一个参数为 `resolvePromise`，第二个参数为 `rejectPromise`：
      1. 如果/当 `resolvePromise` 以 `y` 作为 value 调用，那么运行 `[[Resolve]](promise, y)`；
      2. 如果/当 `rejectPromise` 以 `r` 作为 reason 调用，那么 promise 的状态变为 rejected，其 reason 为 `r`；
      3. 如果 `resolvePromise` 和 `rejectPromise` 都被调用，或者多次以同一个参数调用，那么优先采用第一个被调用的，并忽略其它的调用；
      4. 如果调用 `then()` 时抛出了一个 exception `e`：
         1. 如果 `resolvePromise` 或者 `rejectPromise` 已经被调用过，直接忽略；
         2. 否则 promise 的状态变为 rejected，其 reason 为 e；
   4. 如果 `then` 不是一个函数，那么 promise 的状态变为 fulfilled，其 value 为 `x`；
4. 如果 `x` 不是一个 object 或 function，那么 promise 的状态变为 fulfilled，其 value 为 `x`。

如果一个 promise 被一个参与循环 thenable 链的 thenable 解决，这样 `[[Resolve]](promise, thenable)` 的递归性质最终会导致 `[[Resolve]](promise, thenable)` 再次调用，遵循上述算法将导致无限递归。 鼓励但不是必需的实现来检测这种递归并以信息丰富的 TypeError 作为原因拒绝 Promise。 [3.6]

```js
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
}
```

## Notes

> 1. Here “platform code” means engine, environment, and promise implementation code. In practice, this requirement ensures that `onFulfilled` and `onRejected` execute asynchronously, after the event loop turn in which `then` is called, and with a fresh stack. This can be implemented with either a “macro-task” mechanism such as [`setTimeout`](https://html.spec.whatwg.org/multipage/webappapis.html#timers) or [`setImmediate`](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html#processingmodel), or with a “micro-task” mechanism such as [`MutationObserver`](https://dom.spec.whatwg.org/#interface-mutationobserver) or [`process.nextTick`](https://nodejs.org/api/process.html#process_process_nexttick_callback). Since the promise implementation is considered platform code, it may itself contain a task-scheduling queue or “trampoline” in which the handlers are called.
> 2. That is, in strict mode `this` will be `undefined` inside of them; in sloppy mode, it will be the global object.
> 3. Implementations may allow `promise2 === promise1`, provided the implementation meets all requirements. Each implementation should document whether it can produce `promise2 === promise1` and under what conditions.
> 4. Generally, it will only be known that `x` is a true promise if it comes from the current implementation. This clause allows the use of implementation-specific means to adopt the state of known-conformant promises.
> 5. This procedure of first storing a reference to `x.then`, then testing that reference, and then calling that reference, avoids multiple accesses to the `x.then` property. Such precautions are important for ensuring consistency in the face of an accessor property, whose value could change between retrievals.
> 6. Implementations should *not* set arbitrary limits on the depth of thenable chains, and assume that beyond that arbitrary limit the recursion will be infinite. Only true cycles should lead to a `TypeError`; if an infinite chain of distinct thenables is encountered, recursing forever is the correct behavior.

1. 这里的 "platform code" 指的是引擎、环境和 promise 的执行代码。在实践中，要求我们确保 `onFulfilled` 和 `onRejected` 在调用 `then` 的事件循环之后异步执行，并且使用新的堆栈。这可以使用宏任务（例如：`setTimeout`、`setImmediate`）或者微任务（例如：`MutationObserve`、`process.nextTick`）来实现。由于 Promise 的实现被认为是平台代码，它本身可能包含一个任务调度队列或调用处理程序的 “trampoline“；
2. 也就是说，它们内部的 `this` 在严格模式下为 `undefined`，否则为全局对象；
3. 实现可以允许 `promise2 === promise1`，只要实现满足所有要求。每个实现都应该记录它是否产生 `promise2 === promise1` 以及在什么条件下；
4. 通常，只有当它来自当前的实现，才会知道 `x ` 是一个真正的 promise。本条款允许使用特定于实现的方法来采用已知符合 promises 的状态；
5. 这个首先存储对`x.then`的引用，然后测试该引用，然后调用该引用的过程避免了对`x.then`属性的多次访问。 这样的预防措施对于确保面对访问器属性的一致性很重要，访问器属性的值可能会在检索之间发生变化；
6. 实现不应对可调用链的深度设置任意限制，并假设超出该任意限制，递归将是无限的。 只有真正的循环才会导致“TypeError”； 如果遇到无限的不同 thenable 链，则永远递归是正确的行为。

## 测试代码

Promises/A+ 规范提供了一个专门用于测试代码是否符合该规范的库：`promises-aplus-tests`。

我们只需要在本地安装一下：

```bash
npm i -D promises-aplus-tests
```

然后按他的要求编写如下代码即可：

```js
// test.js
const MyPromise = require('./MyPromise')

MyPromise.defer = MyPromise.deferred = function () {
  const deferred = {}
  const promise = new MyPromise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  deferred.promise = promise

  return deferred
}

module.exports = MyPromise
```

然后在 `package.json` 里面添加运行用的脚本：

```js
// package.json
"script": {
	"test": "promises-aplus-tests ./test/test.js"
}
```

我们通过 `npm run test` 来启动测试脚本，如果测试没有提示错误的话，那么说明我们编写的代码是符合 Promises/A+ 规范的。

## 拓展

### Promise.resolve 和 Promise.reject

1. Promise.resolve(value) 方法返回一个以给定值解析后的 Promise 对象。
   1. 如果这个值是一个 promise ，那么将返回这个 promise ；
   2. 如果这个值是 thenable（即带有 "then" 方法）；
   3. 返回的 promise 会“跟随”这个 thenable 的对象，采用它的最终状态；
   4. 否则返回的 promise 将以此值完成。此函数将类 promise 对象的多层嵌套展平。
2. Promise.reject 返回一个状态为 rejected 的 Promise

```js
const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
}

const isFunction = val => typeof val === 'function'

const isObject = val => typeof val === 'object' && val !== null

const resolvePromise = (promise2, x, resolve, reject) => {
  // 省略部分代码
}

class MyPromise {
  status = STATUS.pending;
  value;
  reason;
  #onFulfilledCallbacks = [];
  #onRejectedCallbacks = [];

  constructor (executor) {
    // 省略部分代码
  }

  // 省略部分代码

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
```

### Promise.all、Promise.race 和 Promise.allsetlled

1. `Promise.all() `方法接收一个 promise 的 iterable 类型（注：Array，Map，Set 都属于 ES6 的 iterable 类型）的输入，并且只返回一个Promise实例， 那个输入的所有 promise 的 resolve 回调的结果是一个数组。这个Promise的 resolve 回调执行是在所有输入的 promise 的 resolve 回调都结束，或者输入的 iterable 里没有 promise 了的时候。它的 reject 回调执行是，只要任何一个输入的 promise 的 reject 回调执行或者输入不合法的 promise 就会立即抛出错误，并且 reject 的是第一个抛出的错误信息。
2. `Promise.race(iterable)` 方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。
3. `Promise.allSettled()` 方法返回一个在所有给定的 promise 都已经fulfilled或rejected后的 promise，并带有一个对象数组，每个对象表示对应的 promise 结果。当您有多个彼此不依赖的异步任务成功完成时，或者您总是想知道每个promise的结果时，通常使用它。
4. `Promise.any()` 方法依然是实验性的，尚未被所有的浏览器完全支持。它当前处于 TC39 第四阶段草案（Stage 4）。暂时不实现

```js
const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
}

const isFunction = val => typeof val === 'function'

const isObject = val => typeof val === 'object' && val !== null

const isPromise = val => {
  if (isObject(val) || isFunction(val)) {
    return isFunction(val.then)
  }
  return false
}

const resolvePromise = (promise2, x, resolve, reject) => {
  // 省略部分代码
}

class MyPromise {
  status = STATUS.pending;
  value;
  reason;
  #onFulfilledCallbacks = [];
  #onRejectedCallbacks = [];

  constructor (executor) {
    // 省略部分代码
  }

  // 省略部分代码

  static all (iterable) {
    return new MyPromise((resolve, reject) => {
      try {
        // Array.from 接收一个 iterable
        // 如果 iterable 不是一个可迭代的对象，
        // 那么将会抛出错误
        const promises = Array.from(iterable)

        const result = []
        let idx = 0

        promises.forEach((promise, index) => {
          if (isPromise(promise)) {
            promise.then(
              x => formatResult(x, index, resolve),
              reject
            )
          } else {
            formatResult(promise, index, resolve)
          }
        })
        
        function formatResult (value, index, resolve) {
          result[index] = value

          // 注意：这里不能使用 rusult.length === promise.length 来判断
          // [empty * 2, 'res'].length === 3
          if (++idx === promises.length) {
            resolve(result)
          }
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  static race (iterable) {
    return new MyPromise((resolve, reject) => {
      try {
        const promises = Array.from(iterable)

        promises.forEach(promise => {
          if (isPromise(promise)) {
            promise.then(resolve, reject)
          } else {
            resolve(promise)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  static allSettled (iterable) {
    return new MyPromise((resolve, reject) => {
      try {
        const promises = Array.from(iterable)
        const result = []
        let idx = 0

        promises.forEach((promise, index) => {
          if (isPromise(promise)) {
            promise.then(
              x => formatResult(STATUS.fulfilled, x, index, resolve),
              r => formatResult(STATUS.rejected, r, index, resolve)
            )
          } else {
            formatResult(STATUS.fulfilled, promise, index, resolve)
          }
        })

        function formatResult (status, value, index, resolve) {
          switch (status) {
            case STATUS.fulfilled:
              result[index] = {
                status: status,
                value
              }
              break
            case STATUS.rejected:
              result[index] = {
                status: status,
                reason: value
              }
              break
            default:
              break
          }

          if (++idx === promises.length) {
            resolve(result)
          }
        }
      } catch (e) {
        reject(e)
      }
    })
  }
}
```

### Promise.prototype.finally

`Promise.prototype.finally()` 方法返回一个 Promise。在 promise 结束时，无论结果是 fulfilled 或者是 rejected，都会执行指定的回调函数。这为在 Promise 是否成功完成后都需要执行的代码提供了一种方式。这避免了同样的语句需要在 then() 和 catch() 中各写一次的情况。

```js
const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected'
}

const isFunction = val => typeof val === 'function'

const isObject = val => typeof val === 'object' && val !== null

const isPromise = val => {
  if (isObject(val) || isFunction(val)) {
    return isFunction(val.then)
  }
  return false
}

const resolvePromise = (promise2, x, resolve, reject) => {
  // 省略部分代码
}

class MyPromise {
  status = STATUS.pending;
  value;
  reason;
  #onFulfilledCallbacks = [];
  #onRejectedCallbacks = [];

  constructor (executor) {
    // 省略部分代码
  }
  
  // 省略部分代码

  finally (onFinally) {
    return this.then(
      value => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => {
        throw reason
      })
    )
  }

  // 省略部分代码
}
```

以上。