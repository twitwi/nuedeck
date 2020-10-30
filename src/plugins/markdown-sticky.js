import { startsWithIgnoreCase, RESTRIM, equalsIgnoreCase } from './tools'

let stickyHeaders = []

export default () => ({
  name: 'MarkdownSticky',

  /*async*/ enrichGeneratedSlidesHeader({ /*type,*/ headerLines }) {
    let i = 0
    let insertSticky = null

    while (i < headerLines.length) {
      let consume = true
      let l = headerLines[i]
      if (equalsIgnoreCase(l, '@STICKY-CLEAR')) {
        stickyHeaders = []
      } else if (startsWithIgnoreCase(l, '@STICKY-ADD:')) {
        stickyHeaders.push(RESTRIM())
      } else if (startsWithIgnoreCase(l, '@STICKY-RM:')) {
        let ind = stickyHeaders.indexOf(RESTRIM())
        if (ind !== -1) {
          stickyHeaders.splice(ind, 1)
        } else {
          console.log(`MarkdownSticky: no header ${RESTRIM()} to remove from ${stickyHeaders}`)
        }
      } else if (startsWithIgnoreCase(l, '@STICKY-NOW')) {
        insertSticky = stickyHeaders.slice(0)
      } else {
        consume = false
      }
      if (consume) {
        headerLines.splice(i, 1)
      } else {
        i++
      }
    }

    let toInsert = insertSticky !== null ? insertSticky : stickyHeaders
    if (toInsert.length > 0) {
      headerLines.splice(0, 0, ...toInsert)
    }
  },
})
