class Trasaction {
    constructor(off) {
        this.toff = off
        this.off = off
        this.btx = false
        this.ch = null
    }

    beginTx() {
        if (this.ch != null) {
            this.ch.forEach(c => { c.resetTx() })
        }
        this.toff = this.off
        this.btx = true
        this.ch = new Array()
    }

    commitTx() {
        if (this.ch != null) {
            this.ch.forEach(c => { c.commitTx() })
        }
        this.ch = null
        this.off = this.toff
        this.btx = false
    }

    knot() {
        if (this.btx) {
            this.off = this.toff
            return
        }

        this.toff = this.off
    }

    offset() {
        if (this.btx) {
            return this.toff
        }

        return this.off
    }

    isInTx() {
        return this.btx
    }

    reset() {
        this.btx = false
    }

    moveto(off) {
        if (this.btx) {
            this.toff = off
            return
        }

        this.off = off
    }

    step(off) {
        if (this.btx) {
            this.toff = this.off + off
            return
        }

        this.off = this.toff + off
    }

    move(obj, off) {
        if (!obj.isInTx() && this.btx) {
            obj.beginTx()
            this.ch.push(obj)
        }

        obj.step(off)
    }
}

class Line extends Trasaction {
    constructor(val) {
        super(0)

        this.val = val
        this.start = 0
        this.end = val.length
    }

    value() {
        return this.val
    }

    left() {
        this.knot()
        return this.val.slice(this.offset())
    }

    len() {

        return this.end
    }

    isEmpty() {
        return this.offset() == this.end
    }

    isBlank() {
        let i = 0
        while (i < this.end
            && (this.val[i] == " " || this.val[i] == "\t")) {
            i++
        }

        return (i == this.end)
    }

    skipSpace() {
        let i = this.offset()
        while (i < this.end
            && (this.val[i] == " " || this.val[i] == "\t")) {
            i++
        }

        this.moveto(i)
        return this
    }

    startWith(str) {
        let i = 0
        let j = this.offset()

        if (str.length > this.len() - j) {
            return false
        }

        while (i < str.length) {
            if (str[i] != this.val[j]) {
                return false
            }

            i++
            j++
        }

        return true
    }
}

class Lines extends Trasaction {
    constructor(txt, s, e) {
        super(s)

        this.txt = txt
        this.start = s
        this.end = e
    }

    value() {
        let ct = ""
        let idx = this.start
        for (; idx < this.end - 1; idx++) {
            let ln = this.txt.line(idx)
            ct += ln.value() + '\n'
        }
        let ln = this.txt.line(idx)
        ct += ln.value()

        return ct
    }

    left() {
        let ct = ""
        let idx = this.start
        for (; idx < this.end - 1; idx++) {
            let ln = this.txt.line(idx)
            ct += ln.left() + '\n'
        }
        let ln = this.txt.line(idx)
        ct += ln.left()

        return ct
    }

    first() {
        return this.txt.line(this.start)
    }

    next() {
        let off = this.offset()
        if (off < this.end - 1) {
            this.moveto(off + 1)
            return this.txt.line(off + 1)
        } else if (off == this.end - 1) {
            this.moveto(this.end)
            return null
        }

        return null
    }

    back() {
        let off = this.offset()
        if (off > 0) {
            this.moveto(off - 1)
            return this.txt.line(off - 1)
        }
    }

    current() {
        return this.txt.line(this.offset())
    }

    number() {
        return this.offset()
    }

    lines(s, e) {
        return new Lines(this.txt, s, e)
    }

    isEmpty() {
        return this.offset() == this.end
    }
}

class Text {
    constructor(lns) {
        this.lns = new Array()
        lns.forEach(ln => {
            this.lns.push(new Line(ln))
        })
    }

    line(lno) {
        return this.lns[lno]
    }

    lines(start, end) {
        if (end == -1) {
            end = this.lns.length
        }

        return new Lines(this, start, end)
    }
}

class Reader {
    constructor() {
    }

    read(txt) {
        let pos = 0
        let ln = ''
        let lns = new Array()
        while (pos < txt.length) {
            if (txt[pos] == '\r') {
                pos++
                continue
            }

            if (txt[pos] == '\n') {
                lns.push(ln)
                ln = ''
            } else {
                ln += txt[pos]
            }

            pos++
        }
        lns.push(ln)
        console.debug("read text to lines ", lns)

        return lns
    }

    load(txt) {
        let lns = this.read(txt)

        return new Text(lns)
    }
}

module.exports = { Reader: Reader, Line: Line }