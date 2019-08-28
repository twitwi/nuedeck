
import { startsWithIgnoreCase, RESTRIM } from './tools'

let my = {
  // todo should be somewhere else (methods of nuedeck), and extensible anyway
  highlightLi (i1, i2, cls, noMerge) {
    let suff = ''
    let mergeSuff = noMerge ? '' : ' data-merge-next'
    if (i2 !== undefined && i2 > 0) suff = `>*>li:nth-child(${i2})`
    if (cls === undefined) cls = 'highlight'
    return [`@inject-end: <span class="step" data-anim="add-class" data-target="[data-root]>*>li:nth-child(${i1})${suff}" data-class="${cls}" ${mergeSuff}></span>`]
  }
}

export default () => ({
  name: 'MarkdownEval',

  /*async*/ enrichGeneratedSlidesHeader({type, headerLines}) {

    // WIP: maybe we should not pass nd at all because it is not totally initialized there, or maybe put a ref in "my"
    // WIP: what's a good name for my?
    // WIP: there are parse variables, should they be in my?
    // WIP: utility functions should be easy to call... easier than my.f()?
    // WIP: this comes before any add-slide-key and copy etc so it is difficult to identify the slide
    // WIP: we might want to still have a frozen version of the parse variables, or if there is an identity a way to say nd.user.info[my.slide] = my.stuff (or user...)

    // proposal? call plugins so they can register functions in the passed object
    // proposal? inject all functions in new Function(...) => good UX, ok also as we can do 1k params ok, 10k slow, 100k no
    // proposal? have a `p` variable (for parse) that contains whatever we want, but also p.slide (a kind of id for it)
    // proposal? (not in this plugin in particular), have a `o` variable (that could actually be nd.userDataO) that is provide/injected, with o.slide = {} by default? (or let the user do whatev)
    // proposal? so we can write o.slide[p.slide].machin = p.bidule
    // proposal? in addition to the slide-key thing that is controllable, maybe have a unique-id/blob for all parsed slides and inject it in some way like the currentSlide
    //           so that later we can  {{ 1 + o.slide[$slide].machin }} or if we help the o.slide[] convention, we could even do a {{ 1 + $slide.machin }} (need to inject $slide) <- not a bad idea at first sight (also do it in addin, not addon)... actually need both $slide and a $slideID

    let i = 0

    while (i < headerLines.length) {
      let l = headerLines[i]
      if (startsWithIgnoreCase(l, '@EVAL-HEADER:')) {
        try {
          let f = new Function('nd', 'my', RESTRIM())
          let res = f(this, my)
          if (Array.isArray(res)) {
            headerLines.splice(i, 1, ...res)
            i += res.length
          } else {
            i++
          }
        } catch (e) {
          console.log("ERROR in @eval-header:", RESTRIM(), e)
          i++
        }
      } else {
        i++
      }
    }

  }

})
