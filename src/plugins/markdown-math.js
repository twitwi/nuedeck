
import { walkTextNodes } from './tools.js'

function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\$^|]/g, '\\$&');
}

export default () => ({
  name: 'MarkdownMath',
  //
  /*async*/ enrichGeneratedSlides({type, body: w, headerLines}) {

    if (headerLines.indexOf('@disable-math') !== -1) return
    // TODO: make an option to actually do process other types
    if (type !== 'md') return

    // TODO: config
    let delimiters = [
      { reg: '[$][$](([^$]|[$](?![$]))+?)[$][$]', ind: 0},
      { reg: '[$]([^$]+?)[$]', ind: 0},
    ]

    let patchers = delimiters.map(({reg, ind}) => ({
      test: new RegExp(reg, 'g'),
      replacer: (match, ...g) => {
        let span = w.getRootNode().createElement('span')
        span.setAttribute('data-special', '')
        span.setAttribute('latex', '')
        span.textContent = g[ind]
        return span.outerHTML
      }
    }))

    walkTextNodes(w, function (txt, parent) {
      if (! txt.trim()) return
      let newTxt = patchers.reduce((acc, {test, replacer}) => acc.replace(test, replacer), txt)
      if (newTxt !== txt) {
        // replace the text node (this) by a set of children
        let fragment = this.getRootNode().createElement('div')
        fragment.innerHTML = newTxt
        for (let node of Array.from(fragment.childNodes)) {
          parent.insertBefore(node, this)
        }
        parent.removeChild(this)
      }
    })
  }

})
