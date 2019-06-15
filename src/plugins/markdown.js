
import showdown from 'showdown'

export function digestAtColonContent(expr, target, targetList) {
  if (targetList === undefined) targetList = [target]
  for (let part of expr.trim().split(' ')) {
    if (part.startsWith('#')) { // ID
      // only to the first child (in case multiple ones got generated)
      target.setAttribute('id', part.substr(1))
    } else if (part.indexOf('=') !== -1) {
      let i = part.indexOf('=')
      let a = part.substr(0, i)
      let v = part.substr(i+1)
      targetList.forEach(el => el.setAttribute(a, v))
    } else if (part.startsWith('/')) { // Container class
      targetList.forEach(el => el.setAttribute('data-container-class', part.substr(1)))
    } else if (part.startsWith('.')) {
      targetList.forEach(el => el.classList.add(part.substr(1)))
    } else {
      targetList.forEach(el => el.classList.add(part))
    }
  }
}

async function makeSlidesFromMarkdown(contentNode, vm) {
  // Content as text
  let content = [].map.call(contentNode.childNodes, x => x.nodeType === x.TEXT_NODE ? x.textContent : x.outerHTML).join('')

  { // Remove trailing spaces
    // TODO make this optional and even metadata configurable (tricky in some sense)
    let lines = content.split('\n')
    let spaces = lines.filter( l => l.trim().length > 0).map( l => l.length - l.replace(/^ */, '').length)
    let remove = spaces.reduce((x,y)=>Math.min(x,y))
    content = lines.map(l => l.substr(remove)).join('\n')
  }

  let slides = []
  { // Split slides at # and ## starting lines
    let lines = content.split('\n')
    // extract line numbers of start of slides
    let slideIndices = lines.map((e, i)=>[e, i]).filter(([e,])=>e.match(/^##*/))
    // integrate lines that are just before a # line, and that start with @ (for metadata etc)
    slideIndices = slideIndices.map(([e,i])=> {
      while (i>0 && lines[i-1].startsWith('@')) {
        i--
      }
      return [e, i]
    })
    // compute the size (number of lines) of each slide for splicing
    let slideSizes = slideIndices.map(([,i], j, l) => j==0 ? i : i - l[j-1][1])
    for (let s of slideSizes) {
      slides.push(lines.splice(0, s))
    }
    slides.push(lines)
  }
  slides = slides.filter(lines => lines.join().trim().length > 0)

  let converter = new showdown.Converter({
    extensions: []
  })
  converter.setOption('noHeaderId',  true),
  converter.setOption('literalMidWordUnderscores', true)
  converter.setOption('disableForced4SpacesIndentedSublists', true)
  converter.setOption('simpleLineBreaks', true)

  let res = []
  for (let lines of slides) {
    let header = []
    {
      let i = 0
      while (lines[i].startsWith('@')) { i++ }
      header = lines.splice(0, i)
    }
    await vm.asyncCallAllPlugins('enrichGeneratedSlidesHeader', {type: 'md', headerLines: header})
    let sraw = lines.join('\n')

    let html = converter.makeHtml(sraw)
    let parser = new DOMParser()
    let wrapper = parser.parseFromString('<section>'+html+'</section>', 'text/html').body

    // TODO: somewhere add a header like @animSystematicReplayOnBack: to
    // and btw, such option might be usefull on non-markdown slides too... should add a header (same syntax in an element) in html too (and call the enricher there also)
    // and in this header, also allow steps (animations) that are done before any anim (and don't count as step)
    // TODO: @unshown to later remove the slide (in an enrich-), e.g. for the overview that we copy

    await vm.asyncCallAllPlugins('enrichGeneratedSlides', {type: 'md', body: wrapper, headerLines: header})

    // apply generic headers of the form @: #myid mycls mycls2
    for (let h of header) {
      if (h.startsWith('@:')) {
        digestAtColonContent(h.substr(2), wrapper.firstChild, Array.from(wrapper.children))
      }
    }

    Array.from(wrapper.children).forEach(s => {
      res.push(slideFromElement(s))
    })
  }
  return res
}

function slideFromElement(s) {
  return {
    contentElement: s,
    containerClass: s.getAttribute('data-container-class'),
    key: s.getAttribute('id')
  }
}

export default () => ({
  name: 'Markdown',

  async generateSlides(slide, contentNode, out) {
    if (slide.getAttribute('data-type') === 'html') {
      // html slides
      let o = Array.from(contentNode.children).map(slideFromElement)
      out.splice(out.length, 0, ...o)
      return 'BREAK'
    } else if (slide.getAttribute('data-type') === 'md') {
      out.splice(out.length, 0, ...await makeSlidesFromMarkdown(contentNode, this))
      return 'BREAK'
    } else if (! slide.getAttribute('data-type')) { // empty type => markdown
      out.splice(out.length, 0, ...await makeSlidesFromMarkdown(contentNode, this))
      return 'BREAK'
    }
  },
})
