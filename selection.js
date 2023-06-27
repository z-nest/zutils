class Position {
    constructor(path, offset) {
        this.path = path.copy()
        this.offset = offset
    }

    copy() {
        return new Position(this.path.copy(), this.offset)
    }
}

class Selection {
    constructor(from, to) {
        this.f = from
        this.t = to
    }

    copy() {
        return new Selection(this.f.copy(), this.t.copy())
    }

    from() {
        return this.f.copy()
    }

    to() {
        return this.t.copy()
    }

    absolute(from, to) {
        this.f.path = this.f.path.concat(from)
        this.t.path = this.t.path.concat(to)
    }

    isForward() {
        let fp = this.f.path
        let tp = this.t.path
        let fidx = fp.length - 1
        let tidx = tp.length - 1

        while (fidx >= 0 && tidx >= 0) {
            if (fp[fidx] < tp[tidx]) {
                return true
            } else if (fp[fidx] > tp[tidx]) {
                return false
            }

            fidx--
            tidx--
        }

        return this.f.offset < this.t.offset
    }

    start() {
        if (this.isForward()) {
            return this.f
        }

        return this.t
    }

    end() {
        if (this.isForward()) {
            return this.t
        }

        return this.f
    }

    union(sel) {
        if (this.f == null || this.f.path.after(sel.f.path)) {
            this.f = sel.f
        }

        if (this.t == null || sel.t.path.after(this.t.path)) {
            this.t = sel.t
        }
    }
}

module.exports = { Position: Position, Selection: Selection }