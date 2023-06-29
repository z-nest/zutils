const { Markdown } = require('../render/markdown')

const LogType = {
    LOAD: 0,
    INSERTBEFORE: 1,
    INSERTAFTER: 2,
    UPDATE: 3,
    DELETE: 4,
    DELETEBEFORE: 5,
    DELETEAFTER: 6,
    SELECT: 7
}

class Logger {
    constructor() {
        this.lgs = new Array()
        this.sel = null
    }

    isEmpty() {
        return this.length == 0
    }

    makeLoadLog(old, nw) {
        let log = {}
        log.type = LogType.LOAD
        log.text = nw
        log.oldText = old

        console.log("make load log", log)
        this.lgs.push(log)
        return this
    }

    makeInsertBeforeLog(anchor, node) {
        let log = {}
        log.type = LogType.INSERTBEFORE
        log.anchor = anchor.copy()
        log.text = new Markdown().render(node)

        console.log("make insert before log", log)
        this.lgs.push(log)
        return this
    }

    makeInsertAfterLog(anchor, node) {
        let log = {}
        log.type = LogType.INSERTAFTER
        log.anchor = anchor.copy()
        log.text = new Markdown().render(node)

        console.log("make insert after log", log)
        this.lgs.push(log)
        return this
    }

    makeUpdateLog(old, nw) {
        let log = {}
        log.type = LogType.UPDATE
        log.path = nw.getPath().copy()
        log.text = new Markdown().renderChild(nw)
        log.oldText = new Markdown().renderChild(old)

        console.log("make update log", log)
        this.lgs.push(log)
        return this
    }

    makeDeleteBeforeLog(anchor, node) {
        let log = {}
        log.type = LogType.DELETEBEFORE
        log.anchor = anchor.copy()
        log.oldText = new Markdown().render(node)

        console.log("make delete log", log)
        this.lgs.push(log)
        return this
    }

    makeDeleteAfterLog(anchor, node) {
        let log = {}
        log.type = LogType.DELETEAFTER
        log.anchor = anchor.copy()
        log.oldText = new Markdown().render(node)

        console.log("make delete log", log)
        this.lgs.push(log)
        return this
    }

    makeSelectionLog(last, now) {
        let log = {}
        log.type = LogType.SELECT
        log.selection = now.copy()
        log.lastSelection = last.copy()

        console.log("make selection log", log)
        this.sel = log
        return this
    }

    inverse() {
        if (this.length == 0) {
            return null
        }

        let lgs = new Array()
        let idx = this.lgs.length - 1
        for (; idx >= 0; idx--) {
            let log = {}
            let lg = this.lgs[idx]
            switch (lg.type) {
                case LogType.LOAD:
                    log.type = LogType.LOAD
                    log.text = lg.oldText
                    break

                case LogType.INSERTBEFORE:
                    log.type = LogType.DELETE
                    log.path = lg.anchor
                    break

                case LogType.INSERTAFTER:
                    log.type = LogType.DELETE
                    log.path = lg.anchor.next()
                    break

                case LogType.UPDATE:
                    log.type = LogType.UPDATE
                    log.path = lg.path
                    log.text = lg.oldText
                    break

                case LogType.DELETEBEFORE:
                    log.type = LogType.INSERTBEFORE
                    log.anchor = lg.anchor.previous()
                    log.text = lg.oldText
                    break

                case LogType.DELETEAFTER:
                    log.type = LogType.INSERTAFTER
                    log.anchor = lg.anchor
                    log.text = lg.oldText
                    break
            }
            lgs.push(log)
        }

        if (this.sel != null) {
            let log = {}
            log.type = LogType.SELECT
            log.selection = this.sel.lastSelection

            lgs.push(log)
        }

        return lgs
    }

    logs() {
        if (this.length == 0) {
            return null
        }

        let lgs = new Array()
        let idx = 0
        for (; idx < this.lgs.length; idx++) {
            let log = {}
            let lg = this.lgs[idx]
            switch (lg.type) {
                case LogType.LOAD:
                    log.type = LogType.LOAD
                    log.text = lg.text
                    break

                case LogType.INSERTBEFORE:
                    log.type = LogType.INSERTBEFORE
                    log.anchor = lg.anchor
                    log.text = lg.text
                    break

                case LogType.INSERTAFTER:
                    log.type = LogType.INSERTAFTER
                    log.anchor = lg.anchor
                    log.text = lg.text
                    break

                case LogType.UPDATE:
                    log.type = LogType.UPDATE
                    log.path = lg.path
                    log.text = lg.text
                    break

                case LogType.DELETEBEFORE:
                    log.type = LogType.DELETE
                    log.path = lg.anchor.previous()
                    break

                case LogType.DELETEAFTER:
                    log.type = LogType.DELETE
                    log.path = lg.anchor.next()
                    break
            }
            lgs.push(log)
        }

        if (this.sel != null) {
            let log = {}
            log.type = LogType.SELECT
            log.selection = this.sel.selection

            lgs.push(log)
        }

        return lgs
    }
}

module.exports = { LogType: LogType, Logger: Logger }