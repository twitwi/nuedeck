
let tools = {
  L () { console.log(...arguments) }
}

export default () => ({
  name: 'MarkdownExtra',
  //
  /*async*/ enrichGeneratedSlides({type, body: w}) {

    // TODO: make an option to actually do process other types
    if (type !== 'md') return

    let may = (f) => f ? f : ()=>{}
    let endsWith = (longStr, part) => longStr.indexOf(part, longStr.length - part.length) !== -1
    let REST = null
    let RESTRIM = null
    let startsWith = (longStr, part) => {
        let res = longStr.substr(0, part.length) == part
        REST = res ? longStr.slice(part.length) : null
        RESTRIM = res ? REST.replace(/^ */, "") : null
        return res
    }
    var startsWithIgnoreCase = (longStr, part) => {
        let res = longStr.substr(0, part.length).toUpperCase() == part.toUpperCase()
        REST = res ? longStr.slice(part.length) : null
        RESTRIM = res ? REST.replace(/^ */, "") : null
        return res;
    }

    Array.from(w.children).forEach(s => {
      if (s.firstChild.tagName && s.firstChild.tagName.match(/^h1$/i)) {
        if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
          var main = RESTRIM.split(/:/);
          var baseSelector = main[0];
          var animPart = main.slice(1).join(':');
          var hasAnim = ! animPart.match(/^\s*$/);
          var base = null;
          s.outerHTML = `<div data-special copy='${main}'>WILL BE REPLACED BY ${main}</div>`
          /*
          for (i in slides) {
            if ($(slides[i]).is(baseSelector)) {
              base = slides[i];
            }
          }
          if (base == null) {
            // TODO should alert based on options
            alert("Could not find matches for selector '"+baseSelector+"' in @COPY");
            return s;
          }
          slide = $(base).clone().get(0);
          slide.removeAttribute('id');
          if (hasAnim) {
            slide.classList.add('anim-continue');
            $('<span>').text('@anim:'+animPart).insertAfter(slide.firstChild); // first is the heading, we want to keep it there
          }
          slides[s] = slide;
          return s;
          */
        }
      }
    })
  }

})
