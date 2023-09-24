class Path extends Array {
    copy() {
        let p = new Path()
        this.forEach((a) => p.push(a))

        return p
    }

    parent() {
        return this.slice(1)
    }

    child(idx) {
        let c = this.copy()
        c.splice(0, 0, idx)
        return c
    }

    previous() {
        let p = this.copy()
        p[0] = p[0] - 1

        return p
    }

    next() {
        let p = this.copy()
        p[0] = p[0] + 1

        return p
    }

    moveToNext() {
        this[0] = this[0] + 1
    }

    equal(p) {
        if (this.length != p.length) {
            return false
        }

        let idx = 0
        while (idx < this.length) {
            if (this[idx] != p[idx]) {
                return false
            }
            idx++
        }

        return true
    }

    after(p) {
        let s = this.length - 1
        let d = p.length - 1

        while (s >= 0 && d >= 0) {
            if (this[s] > p[d]) {
                return true
            }

            s--
            d--
        }

        return false
    }

    node(lv) {
        return this.slice(this.length - lv)
    }

    relative(lv) {
        return this.slice(0, this.length - lv)
    }
}

module.exports = { Path: Path }