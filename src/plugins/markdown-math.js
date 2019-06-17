
import { walkTextNodes, replaceNodeByOuterHTMLFragment, indexOfIgnoreCase } from './tools.js'

export default () => ({
  name: 'MarkdownMath',
  //
  /*async*/ enrichGeneratedSlides({type, body: w, headerLines}) {

    if (indexOfIgnoreCase(headerLines, '@DISABLE-MATH') !== -1) return

    if (type !== 'md') return

    let delimiters = [
      { reg: '[$][$](([^$]|[$](?![$]))+?)[$][$]', ind: 1},
      { reg: '[$]([^$]+?)[$]', ind: 1},
    ]

    let patchers = delimiters.map(({reg, ind}) => ({
      test: new RegExp(reg, 'g'),
      replacer: (...g) => {
        let span = w.getRootNode().createElement('span')
        span.setAttribute('data-special', '')
        span.setAttribute('latex', '')
        span.textContent = g[ind]
        return span.outerHTML
      }
    }))

    walkTextNodes(w, function (txt) {
      if (! txt.trim()) return
      let newTxt = patchers.reduce((acc, {test, replacer}) => acc.replace(test, replacer), txt)
      if (newTxt !== txt) {
        replaceNodeByOuterHTMLFragment(this, newTxt)
      }
    })
  }

})
