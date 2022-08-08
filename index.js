// const p = new Promise((resolve, reject) => {
//   resolve(1)
// })

// p.then(res => {
//   console.log(res)
// })

// const MyPromise = require('./promise/MyPromise3')

// const p = new MyPromise((resolve, reject) => {
//   resolve(1)
//   // reject('err')
// })

// p.then(res => {
//   console.log(res)
// }, err => {
//   console.log(err)
// })

// p.then(res => {
//   console.log(res)
// }, err => {
//   console.log(err)
// })

// p.then(res => {
//   console.log(res)
// }, err => {
//   console.log(err)
// })

// const MyPromise = require("./promise/MyPromise4");

// const p1 = MyPromise.resolve('Success')
// const p2 = MyPromise.reject('Error')

// p1.then(res => {
//   console.log('fulfulled: ', res)
// })

// p2.catch(err => {
//   console.log('rejected: ', err)
// })

// const p1 = MyPromise.resolve({
//   then: function(onFulfill, onReject) { onFulfill("fulfilled!"); }
// });
// console.log(p1 instanceof MyPromise) // true，这是一个 Promise 对象


// // Thenable 在 callback 之前抛出异常
// // Promise rejects
// let thenable = { then: function(resolve) {
//   throw new TypeError("Throwing");
//   resolve("Resolving");
// }};

// const p2 = MyPromise.resolve(thenable);
// p2.then(function(v) {
//   // 不会被调用
// }, function(e) {
//   console.log(e); // TypeError: Throwing
// });

// // Thenable 在 callback 之后抛出异常
// // Promise resolves
// thenable = { then: function(resolve) {
//   resolve("Resolving");
//   throw new TypeError("Throwing");
// }};

// const p3 = MyPromise.resolve(thenable);
// p3.then(function(v) {
//   console.log(v); // 输出"Resolving"
// }, function(e) {
//   // 不会被调用
//   console.log(e)
// });

const MyPromise = require('./promise/MyPromise5')

// const sleep = delay => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(delay)
//     })
//   }, delay)
// }

// MyPromise.all([
//   1,
//   sleep(1000),
//   sleep(500)
// ]).then(
//  res => {
//   console.log('fulfilled: ', res)
//  },
//  err => {
//   console.log('rejected: ', err)
//  }
// )

// const promise1 = new MyPromise((resolve, reject) => {
//   setTimeout(resolve, 500, 'one');
// });

// const promise2 = new MyPromise((resolve, reject) => {
//   setTimeout(resolve, 100, 'two');
// });

// MyPromise.race([promise1, promise2]).then((value) => {
//   console.log(value);
//   // Both resolve, but promise2 is faster
// });
// // expected output: "two"

const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, 'foo'));
const promises = [promise1, promise2];

Promise.allSettled(promises).
  then((results) => results.forEach((result) => console.log(result)));
