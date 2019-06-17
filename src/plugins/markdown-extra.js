
import { startsWithIgnoreCase, RESTRIM } from './tools'

let tools = {
  L () { console.log(...arguments) }
}

export default () => ({
  name: 'MarkdownExtra',
  //
  /*async*/ enrichGeneratedSlides({type, body: w}) {

    if (type !== 'md') return

    let may = (f) => f ? f : ()=>{}

    Array.from(w.children).forEach(s => {


      if (s.firstChild.tagName && s.firstChild.tagName.match(/^h1$/i)) {
        if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
          var main = RESTRIM().split(/:/);
          var baseSelector = main[0];
          var animPart = main.slice(1).join(':');
          var hasAnim = ! animPart.match(/^\s*$/);
          var base = null;
          s.outerHTML = `<div data-special copy='${main}'>WILL BE REPLACED BY ${main}</div>`
        }
      }
    })
  }

})
