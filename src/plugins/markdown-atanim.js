
import { walkTextNodes, replaceNodeByOuterHTMLFragment, indexOfIgnoreCase, startsWith, startsWithIgnoreCase, RESTRIM } from './tools.js'

export default () => ({
  name: 'MarkdownAtAnim',
  //
  /*async*/ enrichGeneratedSlides({type, body: w, headerLines}) {

    if (indexOfIgnoreCase(headerLines, '@DISABLE-AT-ANIM') !== -1) return

    if (type !== 'md') return

    let makeSpan = (type, attrs) => {
      let span = w.getRootNode().createElement('span')
      span.classList.add('step')
      span.classList.add('displaynone')
      span.setAttribute('data-anim', type)
      for (let a in attrs) {
        span.setAttribute(a, attrs[a])
      }
      return span
    }

    // TODO consider a @anim: and a @anim-legacy: if need to update
    // idea: / as a separator?
    // idae: instead of %+, %..., have either a function call like, or @+ @...? (check for minimal conflict with css etc)
    let parseAnim = (txt) => {
      let line = txt.replace(/%[+]/g, '%%') // protect the "%+class" from being split
      let allToAdd = []
      let parts = line.split(/ *\| */)
      for (let i in parts) {
        // process each group of simultaneous animations
        var subparts = parts[i].split(/ *\+ */)
        for (let ii in subparts) {
          var what = subparts[ii]
          if (what === "") continue // as a good side effect, this allows to set a "anim-continue" on all elements (e.g., put a + at the end of the line)
          let continuating = ii != subparts.length-1
          let toAdd = null

          // TODO take back animationDuration etc
          if (startsWithIgnoreCase(what, 'NONE')) {

          } else if (startsWith(what, "%%")) {
            let main = RESTRIM().split(/ *: */);
            if (main[0].startsWith("/")) {
              toAdd = makeSpan('add-class...TODO', {'data-target': RESTRIM()} )
              //addClass(toAdd, "anim-addcontainerclass");
              //addSpaceSeparatedAttr(toAdd, "data-class", main[0].substr(1));
            } else {
              toAdd = makeSpan('add-class', {
                'data-class': main[0],
                'data-target': main.slice(1).join(':')
              })
            }
          } else if (startsWith(what, "%-")) {
            let main = RESTRIM().split(/ *: */);
            if (main[0].startsWith("/")) {
              toAdd = makeSpan('remove-class...TODO', {'data-target': RESTRIM()} )
              //addClass(toAdd, "anim-addcontainerclass");
              //addSpaceSeparatedAttr(toAdd, "data-class", main[0].substr(1));
            } else {
              toAdd = makeSpan('remove-class', {
                'data-class': main[0],
                'data-target': main.slice(1).join(':')
              })
            }
          } else if (startsWith(what, "+")) {
            toAdd = makeSpan('show', {'data-target': RESTRIM()} )
          } else if (startsWith(what, "-")) {
            toAdd = makeSpan('hide', {'data-target': RESTRIM()} )
          } else {
            toAdd = makeSpan('show', {'data-target': what})
          }
          if (toAdd !== null) {
            //console.log("SPAN", toAdd.outerHTML)
            if (continuating) toAdd.setAttribute('data-merge-next', true)
            allToAdd.push(toAdd)
          }
        }
      }
      let res = allToAdd.map(e => e.outerHTML).join('')
      return res
    }

    walkTextNodes(w, function (txt) {
      if (startsWithIgnoreCase(txt, '@ANIM:')) {
        let newTxt = parseAnim(RESTRIM())
        if (this.parentNode.childNodes.length == 1) {
          replaceNodeByOuterHTMLFragment(this.parentNode, newTxt)
        } else {
          replaceNodeByOuterHTMLFragment(this, newTxt)
        }
      }
    })
  }

})
