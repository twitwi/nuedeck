
import { startsWithIgnoreCase, RESTRIM, indexOfIgnoreCase } from './tools'

export default () => ({
  name: 'MarkdownExtra',
  //
  /*async*/ enrichGeneratedSlides({type, body: w, headerLines}) {

    if (type !== 'md') return

    Array.from(w.children).forEach(s => {

      if (indexOfIgnoreCase(headerLines, '@FOR-COPY') !== -1) {
        s.setAttribute('data-for-copy', 'true')
        // The slide will be removed later, after it can be copied
      }

      if (s.firstChild.tagName && s.firstChild.tagName.match(/^h[12]$/i)) {
        if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
          let main = RESTRIM()
          s.innerHTML = `<div data-special copy='${main}'>WILL BE REPLACED BY ${main}</div>`
        }
      }

      let prefix = ''
      for (let header of headerLines) {
        if (startsWithIgnoreCase(header, '@INJECT:')) {
          // TODO maybe splice the header to remove consumed @INJECT
          prefix += RESTRIM()
        }
      }
      if (prefix !== '') {
        s.innerHTML = prefix + s.innerHTML
      }
    })
  }

})
