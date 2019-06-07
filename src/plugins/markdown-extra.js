
let tools = {
  L () { console.log(...arguments) }
}

export default () => ({
  name: 'MarkdownExtra',
  //
  enrichSlides({type, body: w}, ...more) {

    // TODO: make an option to actually do process other types
    if (type !== 'md') return

    // w is a wrapper (body element actually) that contains the slide content
    // NB: it is a single slide (for now)
    let d = w.getRootNode()

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

    // TODO KNOW HOW TO HANDLE THE FACT THAT @COPY WILL REFERENCE OTHER SLIDE (that have no ids for now)
    // -> the actually copy will be later, maybe with another extension even,, or even a special component
    Array.from(w.children).forEach(s => {
      tools.L("CHILD", s.firstChild)
      if (s.firstChild.tagName.match(/^h1$/i)) {
        if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
          var main = RESTRIM.split(/:/);
          var baseSelector = main[0];
          var animPart = main.slice(1).join(':');
          var hasAnim = ! animPart.match(/^\s*$/);
          var base = null;
          s.outerHTML = `<section copy='${main}'>TODO DO REPLACE BY ${main}</section>`
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
