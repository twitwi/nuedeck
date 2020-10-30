import { walkTextNodes, replaceNodeByOuterHTMLFragment, indexOfIgnoreCase } from './tools.js'

import { digestAtColonContent } from './markdown.js'

export default () => ({
  name: 'MarkdownSuffixes',
  //
  /*async*/ enrichGeneratedSlides({ type, body: w, headerLines }) {
    if (indexOfIgnoreCase(headerLines, '@DISABLE-SUFFIXES') !== -1) return

    if (type !== 'md') return

    let comment = new RegExp('// (.*)$')
    walkTextNodes(w, function(txt) {
      if (!txt.trim()) return
      let newTxt = txt.replace(comment, (...g) => {
        let span = w.getRootNode().createElement('span')
        span.classList.add('comment')
        span.textContent = g[1]
        return span.outerHTML
      })
      if (newTxt !== txt) {
        replaceNodeByOuterHTMLFragment(this, newTxt)
      }
    })

    let atColon = new RegExp('@:(.*)$')
    walkTextNodes(w, function(txt) {
      if (!txt.trim()) return
      let mods = []
      let newTxt = txt.replace(atColon, (...g) => {
        mods.push(g[0])
        return ''
      })
      if (txt !== newTxt) {
        // consider adding
        this.nodeValue = newTxt
      }
      for (let mod of mods) {
        digestAtColonContent(mod.substr(2), this.parentNode)
      }
    })
  },
})
