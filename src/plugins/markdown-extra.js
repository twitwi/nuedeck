import { startsWithIgnoreCase, RESTRIM, indexOfIgnoreCase } from './tools'

export default () => ({
  name: 'MarkdownExtra',
  //
  /*async*/ enrichGeneratedSlides({ type, body: w, headerLines }) {
    if (type !== 'md') return

    for (let i = 0; i < w.children.length; i++) {
      let s = w.children[i]

      if (indexOfIgnoreCase(headerLines, '@FOR-COPY') !== -1) {
        s.setAttribute('data-for-copy', 'true')
        // The slide will be removed later, after it can be copied
      }

      // slide copy
      if (s.firstChild.tagName && s.firstChild.tagName.match(/^h[12]$/i)) {
        if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
          let main = RESTRIM()
          s.outerHTML = `<div data-special data-copy="${main}" data-whole></div>`
          s = w.children[i]
        }
      }

      // injection of content from the header
      {
        let prefix = ''
        let suffix = ''
        for (let header of headerLines) {
          if (startsWithIgnoreCase(header, '@INJECT:')) {
            // TODO maybe splice the header to remove consumed @INJECT
            prefix += RESTRIM()
          }
          if (startsWithIgnoreCase(header, '@INJECT-END:')) {
            suffix += RESTRIM()
          }
        }
        if (prefix !== '') {
          s.setAttribute('data-inject-prefix', prefix)
        }
        if (suffix !== '') {
          s.setAttribute('data-inject-suffix', suffix)
        }
      }
    }
  },
})
