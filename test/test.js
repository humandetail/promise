const MyPromise = require('../promise/MyPromise7')

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
