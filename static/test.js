console.log("hello world");

function test() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello anita");
    }, 1000);
  });
}

const foo = await test();
const bar = await fetch("http://localhost:3000/api/hello");
console.log(foo);
console.log(await bar.json());
