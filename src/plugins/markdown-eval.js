
import { startsWithIgnoreCase, RESTRIM } from './tools'

let my = {
  // todo should be somewhere else (methods of nuedeck), and extensible anyway
  highlightLi (i1, i2, cls, noMerge) {
    let suff = ''
    let mergeSuff = noMerge ? '' : ' data-merge-next'
    if (i2 !== undefined && i2 > 0) suff = `>*>li:nth-child(${i2})`
    if (cls === undefined) cls = 'highlight'
    return [`@inject-end: <span class="step" data-anim="add-class" data-target="[data-root]>*>li:nth-child(${i1})${suff}" data-class="${cls}" ${mergeSuff}></span>`]
  }
}

export default () => ({
  name: 'MarkdownEval',

  /*async*/ enrichGeneratedSlidesHeader({type, headerLines}) {

    let i = 0

    while (i < headerLines.length) {
      let l = headerLines[i]
      if (startsWithIgnoreCase(l, '@EVAL-HEADER:')) {
        try {
          let f = new Function('nd', 'my', RESTRIM())
          let res = f(this, my)
          if (Array.isArray(res)) {
            headerLines.splice(i, 1, ...res)
            i += res.length
          } else {
            i++
          }
        } catch (e) {
          console.log("ERROR in @eval-header:", RESTRIM(), e)
          i++
        }
      } else {
        i++
      }
    }

  }

})
