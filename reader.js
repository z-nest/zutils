class Line {
    constructor(no, ln) {
        this.no = no
        this.v = ln
        this.off = 0
        this.toff = 0
    }

    number() {
        return this.no
    }

    beginTx() {
        this.toff = this.off

        return this
    }

    commitTx() {
        this.off = this.toff
        if (this.off > this.v.length) {
            this.off = this.v.length
        }

        return this
    }

    move(pos) {
        this.toff = this.off + pos

        return this
    }

    value() {
        return this.v.slice(this.off)
    }

    EOL() {
        return this.off == this.v.length
    }
}

class Lines {
    constructor(txt, s, e) {
        this.txt = txt
        this.st = s
        this.end = e
        this.cur = s
        this.tcur = s
        this.tx = null
    }

    beginTx() {
        this.tcur = this.cur
        this.tx = new Array()

        return this
    }

    commitTx() {
        this.cur = this.tcur
        this.tx.forEach(ln => { ln.commitTx() })
        this.tx = null

        return this
    }

    value() {
        let ct = ""
        let idx = this.st
        for (; idx < this.end - 1; idx++) {
            let ln = this.txt.line(idx)
            ct += ln.value() + '\n'
        }
        let ln = this.txt.line(idx)
        ct += ln.value()

        return ct
    }

    first() {
        return this.txt.line(this.st)
    }

    next() {
        if (this.tcur < this.end - 1) {
            return this.txt.line(++this.tcur)
        }
        this.tcur = this.end
        return null
    }

    back() {
        if (this.tcur > 0) {
            return this.txt.line(--this.tcur)
        }
    }

    current() {
        return this.txt.line(this.tcur)
    }

    to(ln) {
        if (ln >= this.st && ln <= this.end) {
            this.tcur = ln
            return this.txt.line(ln)
        }

        return null
    }

    number() {
        return this.tcur
    }

    lines(s, e) {
        return new Lines(this.txt, s, e)
    }

    move(lno, pos) {
        this.tx.push(this.txt.line(lno).move(pos))
    }

    EOLS() {
        return this.cur == this.end
    }
}

class Text {
    constructor(lns) {
        this.lns = new Array()
        let i = 0
        lns.forEach(ln => {
            this.lns.push(new Line(i, ln))
            i++
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