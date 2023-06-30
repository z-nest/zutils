class Transaction {
    constructor(p) {
        this.p = p
        this.da = new Array()
    }

    begin() {
        if (this.p != null) {
            this.p.begin()
        }
    }

    empty() {
        return this.da.length == 0
    }

    push(obj, data) {
        this.da.push({ object: obj, data: data })
    }

    commit() {
        this.da.forEach(ele => {
            ele.object.commit(ele.data)
        })

        if (this.p != null) {
            this.p.commit()
        }
    }
}

class RSlice {
    constructor(start, end, value) {
        this.start = start
        this.end = end
        this.value = value
    }

    value() {
        return this.value
    }
}

class RBlock {
    constructor(v) {
        this.offset = 0
        this.v = v
        this.sls = new Array()
    }

    value() {
        return this.v
    }

    left() {
        if (this.offset >= this.v.length) {
            return null
        }

        return this.v.slice(this.offset, this.v.length)
    }

    slice(off) {
        let v = this.v.slice(this.offset, this.offset + off)
        this.sls.push(new RSlice(this.offset, this.offset + off, v))

        this.offset += off
        if (this.offset > this.v.length) {
            this.offset = this.v.length
        }

        return v
    }

    slices() {
        return this.sls
    }

    EOB() {
        return this.offset == this.v.length
    }
}

class RLine {
    constructor(v) {
        this.off = 0
        this.v = v
    }

    commit(off) {
        this.off += off
        if (this.off > this.v.length) {
            this.off = this.v.length
        }
    }

    value() {
        return this.v.slice(this.off)
    }

    EOL() {
        return this.commit == this.v.length
    }
}

class RLines {
    constructor(r, s, e) {
        this.r = r
        this.start = s
        this.end = e
        this.cur = s
        this.tcur = s
    }

    begin() {
        this.tcur = this.cur
    }

    commit() {
        this.cur = this.tcur
    }

    first() {
        return this.r.line(this.start)
    }

    next() {
        if (this.tcur < this.end - 1) {
            return this.r.line(++this.tcur)
        }
        this.tcur = this.end
        return null
    }

    back() {
        if (this.tcur > 0) {
            return this.r.line(--this.tcur)
        }
    }

    current() {
        return this.r.line(this.tcur)
    }

    number() {
        return this.tcur
    }

    to(ln) {
        if (ln >= this.start && ln <= this.end) {
            this.tcur = ln
            return this.r.line(ln)
        }

        return null
    }

    block(s, e) {
        let v = ""
        for (let i = s; i < e; i++) {
            let ln = this.r.line(i)
            v += ln.value()
        }

        return new RBlock(v)
    }

    EOLS() {
        return this.cur == this.end
    }
}

class Reader {
    constructor(txt) {
        this.text = txt
        this.cur = 0
        this.lns = new Array()
        this.len = 0

        this.read()
    }

    read() {
        let pos = 0
        let ln = ''
        while (pos < this.text.length) {
            if (this.text[pos] == '\r') {
                pos++
                continue
            }

            if (this.text[pos] == '\n') {
                this.lns.push(new RLine(ln))
                ln = ''
            } else {
                ln += this.text[pos]
            }

            pos++
        }
        this.lns.push(new RLine(ln))
        this.len = this.lns.length

        console.debug("read text to lines ", this.lns)
        return
    }

    line(ln) {
        if (ln >= this.len) {
            return null
        }

        return this.lns[ln]
    }

    empty() {
        return this.text.length == 0
    }

    length() {
        return this.lns.length
    }

    lines(s, e) {
        if (this.lns.length == 0) {
            return null
        }

        if (e == -1) {
            e = this.lns.length
        }

        return new RLines(this, s, e)
    }
}

module.exports = { Reader: Reader, RLines: RLines, RLine: RLine, RBlock: RBlock, Transaction: Transaction }