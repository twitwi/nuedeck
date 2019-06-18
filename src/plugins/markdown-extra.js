
import { startsWithIgnoreCase, RESTRIM, indexOfIgnoreCase } from './tools'

export default () => ({
  name: 'MarkdownExtra',
  //
  /*async*/ enrichGeneratedSlides({type, body: w, headerLines}) {

    if (type !== 'md') return

    Array.from(w.children).forEach(s => {

      if (indexOfIgnoreCase(headerLines, '@FOR-COPY') !== -1) {
        s.setAttribute('data-for-copy', 'true')
      }

      if (s.firstChild.tagName && s.firstChild.tagName.match(/^h[12]$/i)) {
        if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
          var main = RESTRIM().split(/:/);
          //var baseSelector = main[0];
          //var animPart = main.slice(1).join(':');
          //var hasAnim = ! animPart.match(/^\s*$/);
          //var base = null;
          s.outerHTML = `<div data-special copy='${main}'>WILL BE REPLACED BY ${main}</div>`
        }
      }
    })
  }

})
