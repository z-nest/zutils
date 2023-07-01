const { Path } = require('zutils/path')

const fs = require('fs')

test('test markdown path next', () => {
    let start = Date.now()

    let p = new Path(1, 0, 0)

    let np = p.next()

    expect(np).toEqual([2, 0, 0])

    let finish = Date.now()

    console.log("finish test path next: ", finish - start, "ms")
});

test('test markdown path equal', () => {
    let start = Date.now()

    let p = new Path(1, 0, 0)

    let np = new Path(2, 0, 0)

    let b = p.equal(np)

    expect(b).toEqual(false)

    let finish = Date.now()

    console.log("finish test path equal: ", finish - start, "ms")
});
