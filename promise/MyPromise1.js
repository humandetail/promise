// promise 的状态必须是这三种之一：pending、fulfilled 或 rejected。

// 1. 当状态为 pending 时，promise：
//    1. 可以转变为 fulfilled 或 rejected 状态；
// 2. 当状态为 fulfilled 时，promise：
//    1. 不可以转变成其它状态；
//    2. 必须拥有一个不可变的 value；
// 3. 当状态为 rejected 时，promise：
//    1. 不可以转变成其它状态；
//    2. 必须拥有一个不可变的 reason。

// 这里的 “不可变” 意味着不能改变它的值（或引用）（i.e. `===`），但并不是深度不可变（shallowReadonly）。

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

module.exports = MyPromise
