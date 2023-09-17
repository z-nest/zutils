class Immnode {
    constructor() {
        this.ch = new Array() // child list
        this.pt = null        // path
        this.mk = false       // marked
    }

    eachChild(cb) {
        this.ch.forEach((ch) => cb(ch))
    }

    hasChild() {
        return this.ch.length != 0
    }

    copy(nd) {
        this.ch = Array.from(nd.ch)
        this.pt = nd.pt
    }

    child(nd) {
        this.ch.push(nd)
        return nd
    }

    childrenNum() {
        return this.ch.length
    }

    getChildren() {
        return this.ch
    }

    getChild(idx) {
        return this.ch[idx]
    }

    path(pat) {
        this.pt = pat

        return this
    }

    getPath() {
        return this.pt
    }

    find(path) {
        let p = this
        let idx = path.length - 1
        while (idx >= 0) {
            p = p.ch[path[idx]]
            idx--
        }
        p.pt = path.concat(this.pt)

        return p
    }

    firstChild() {
        if (this.ch.length == 0) {
            return null
        }

        return this.ch[0]
    }

    lastChild() {
        if (this.ch.length == 0) {
            return null
        }

        return this.ch[this.ch.length - 1]
    }

    firstLeafPath() {
        let lf = this
        let path = this.pt.copy()

        while (lf.ch.length != 0) {
            lf = lf.ch[0]
            path.splice(0, 0, 0)
        }

        return path
    }

    firstLeaf() {
        let lf = this
        let path = this.pt.copy()

        while (lf.ch.length != 0) {
            lf = lf.ch[0]
            path.splice(0, 0, 0)
        }
        lf.pt = path

        return lf
    }

    lastLeafPath() {
        let lf = this
        let path = this.pt.copy()

        while (lf.ch.length != 0) {
            path.splice(0, 0, lf.ch.length - 1)
            lf = lf.ch[lf.ch.length - 1]
        }

        return path
    }

    lastLeaf() {
        let lf = this
        let path = this.pt.copy()

        while (lf.ch.length != 0) {
            path.splice(0, 0, lf.ch.length - 1)
            lf = lf.ch[lf.ch.length - 1]
        }
        lf.pt = path

        return lf
    }

    insertAt(idx, nd) {
        if (idx > this.ch.length) {
            return
        }

        this.ch.splice(idx, 0, nd)

        return this
    }

    removeAt(idx) {
        if (idx >= this.ch.length) {
            return
        }

        this.ch.splice(idx, 1)

        return this
    }

    replaceAt(idx, nd) {
        if (idx >= this.ch.length) {
            return
        }
        nd.copy(this.ch[idx])
        this.ch.splice(idx, 1, nd)

        return this
    }

    marked() {
        this.mk = true
    }

    unmark() {
        this.mk = false
    }

    isMarked() {
        return this.mk
    }
}

class Immtree {
    constructor(root = null) {
        this.rt = root
    }

    root() {
        return this.rt
    }

    copy(tree) {
        this.rt.copy(tree.rt)
    }

    immutable(path) {
        let tree = this.clone()

        if (path.length == 0) {
            return tree
        }

        let idx = path.length - 1
        let snd = this.rt
        let dnd = tree.rt
        while (idx >= 0) {
            snd = snd.ch[path[idx]]
            dnd.ch[path[idx]] = snd.clone()
            dnd = dnd.ch[path[idx]]

            idx--
        }

        return tree
    }

    find(path) {
        let nd = this.rt
        if (path.length == 0) {
            return nd.path(path)
        }

        let idx = path.length - 1
        while (idx >= 0 && path[idx] < nd.ch.length) {
            nd = nd.ch[path[idx]]
            idx--
        }

        if (idx >= 0) {
            return null
        }

        return nd.path(path)
    }

    appendChild(path, nd) {
        let tree = this.immutable(path)

        let pnd = tree.find(path)
        pnd.insertAt(0, nd)

        return tree
    }

    insertBefore(path, nd) {
        let ppath = path.slice(1)
        let tree = this.immutable(ppath)

        let pnd = tree.find(ppath)
        pnd.insertAt(path[0], nd)

        return tree
    }

    insertAfter(path, nd) {
        let ppath = path.slice(1)
        let tree = this.immutable(ppath)

        let pnd = tree.find(ppath)
        pnd.insertAt(path[0] + 1, nd)

        return tree
    }

    remove(path) {
        let ppath = path.slice(1)
        let tree = this.immutable(ppath)

        let pnd = tree.find(ppath)
        pnd.removeAt(path[0])

        return tree
    }

    update(path, nd) {
        let ppath = path.slice(1)
        let tree = this.immutable(ppath)

        let pnd = tree.find(ppath)
        pnd.replaceAt(path[0], nd)

        return tree
    }

    isLeaf(path) {
        let nd = this.find(path)
        return nd.ch.length == 0
    }

    parentPath(path) {
        return path.slice(1)
    }

    parent(path) {
        let ppath = path.slice(1)
        return this.find(ppath)
    }

    previousPath(path) {
        let pa = path

        let pp = this.previousSblingPath(pa)
        while (pp == null && pa.length > 1) {
            pa = this.parentPath(pa)
            pp = this.previousSblingPath(pa)
        }

        if (pp == null) {
            return null
        }

        let nd = this.find(pp)
        return nd.lastLeafPath()
    }

    previous(path) {
        let pa = path

        let pp = this.previousSblingPath(pa)
        while (pp == null && pa.length > 1) {
            pa = this.parentPath(pa)
            pp = this.previousSblingPath(pa)
        }

        if (pp == null) {
            return null
        }

        let nd = this.find(pp)
        return nd.lastLeaf()
    }

    nextPath(path) {
        let pa = path

        let np = this.nextSblingPath(pa)
        while (np == null && pa.length > 1) {
            pa = this.parentPath(pa)
            np = this.nextSblingPath(pa)
        }

        if (np == null) {
            return null
        }

        let nd = this.find(np)
        return nd.firstLeafPath()
    }

    next(path) {
        let pa = path

        let np = this.nextSblingPath(pa)
        while (np == null && pa.length > 1) {
            pa = this.parentPath(pa)
            np = this.nextSblingPath(pa)
        }

        if (np == null) {
            return null
        }

        let nd = this.find(np)
        return nd.firstLeaf()
    }

    previousSblingPath(path) {
        let pa = this.parent(path)

        if (path[0] == 0) {
            return null
        }

        let np = path.copy()
        np[0] = path[0] - 1

        return np
    }

    previousSbling(path) {
        if (path[0] == 0) {
            return null
        }

        let np = path.copy()
        np[0] = path[0] - 1

        return this.find(np)
    }

    nextSblingPath(path) {
        let pa = this.parent(path)

        if (path[0] >= pa.ch.length - 1) {
            return null
        }

        let np = path.copy()
        np[0] = path[0] + 1

        return np
    }

    nextSbling(path) {
        let np = path.copy()
        np[0] = path[0] + 1

        return this.find(np)
    }

    isBeginOfNode(path, offset, lv) {
        let ppath = path.slice(path.length - lv)
        let pa = this.find(ppath)

        let l = path.length - 1 - lv
        while (l >= 0 && pa.ch.length != 0) {
            if (path[l] != 0) {
                return false
            }
            pa = pa.ch[path[l]]
            l--
        }

        // if (pa.ch.length != 0 || l >= 0) {
        //     return false
        // }

        return pa.isBegin(offset)
    }

    isEndOfNode(path, offset, lv) {
        let ppath = path.slice(path.length - lv)
        let pa = this.find(ppath)

        let l = path.length - 1 - lv
        while (l >= 0 && pa.ch.length != 0) {
            if (path[l] != pa.ch.length - 1) {
                return false
            }
            pa = pa.ch[path[l]]
            l--
        }

        // if (pa.ch.length != 0 || l >= 0) {
        //     return false
        // }

        return pa.isEnd(offset)
    }

    splitLeaf(path, offset) {
        let nd = this.find(path)
        if (nd.isBegin(offset)) {
            return { tree: this, ns: 0 }
        }

        if (nd.isEnd(offset)) {
            return { tree: this, ns: 1 }
        }

        let svs = nd.split(offset)
        if (svs == null) {
            return { tree: this, ns: 0 }
        }

        let tree = this
        tree = tree.update(path, svs[0])
        tree = tree.insertAfter(path, svs[1])

        return { tree: tree, ns: 1 }
    }

    splitNode(path, offset) {
        let nd = this.find(path)
        if (offset == 0) {
            return { tree: this, ns: 0 }
        }

        if (offset == nd.ch.length) {
            return { tree: this, ns: 1 }
        }

        let tree = this.immutable(path)
        nd = tree.find(path)
        let nnd = nd.clone()
        nnd.ch = nd.ch.slice(offset)
        nd.ch = nd.ch.slice(0, offset)
        tree = tree.insertAfter(path, nnd)

        return { tree: tree, ns: 1 }
    }

    split(path, offset, lv = 0) {
        let rs = this.splitLeaf(path, offset)

        let idx = 1
        while (idx <= path.length - lv) {
            let np = path.slice(idx)
            rs = rs.tree.splitNode(np, path[idx - 1] + rs.ns)
            idx++
        }

        return rs.tree
    }

    concatLeaf(path) {
        let np = this.nextSblingPath(path)
        let nd = this.find(path)
        let nt = this.find(np)

        let nnd = nd.concat(nt)
        let tree = this.update(path, nnd)

        return tree.remove(np)
    }

    concatNode(path) {
        let np = this.nextSblingPath(path)
        let nd = this.find(path)
        let nt = this.find(np)

        let nnd = nd.concat(nt)
        let tree = this.update(path, nnd)
        nd = tree.find(path)
        nt.ch.forEach(c => { nd.child(c) });

        return tree.remove(np)
    }

    concat(path) {
        if (this.isLeaf(path)) {// leaf concat
            return this.concatLeaf(path)
        }

        // node concat
        return this.concatNode(path)
    }

    leavesUnder(pa, offset, ls) {
        let n = pa.childrenNum()
        if (offset >= n) {
            return false
        }

        let i = offset
        let nd = null
        for (; i < n; i++) {
            nd = pa.getChild(i)
            if (nd.isMarked()) {
                return true
            }

            if (!nd.hasChild()) {
                ls.push(nd)
                continue
            }

            if (this.leavesUnder(nd, 0, ls)) {
                return true
            }
        }

        return false
    }

    leavesInRange(from, to) {
        let ls = new Array()

        let f = this.find(from)
        f.marked()
        let t = this.find(to)
        t.marked()
        ls.push(f)

        let pa = this.parent(from)
        let offset = from[0] + 1
        this.leavesUnder(pa, offset, ls)

        ls.push(t)
        return ls
    }
}

module.exports = { Immnode: Immnode, Immtree: Immtree }