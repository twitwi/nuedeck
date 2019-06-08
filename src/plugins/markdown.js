
import showdown from 'showdown'

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
    let sraw = lines.join('\n')

    let html = converter.makeHtml(sraw)
    let parser = new DOMParser()
    let wrapper = parser.parseFromString('<section>'+html+'</section>', 'text/html').body

    await vm.asyncCallAllPlugins('enrichGeneratedSlides', {type: 'md', body: wrapper, headerLines: header})

    // apply generic headers of the form @: #myid mycls mycls2
    for (let h of header) {
      if (h.startsWith('@:')) {
        for (let part of h.substr(2).trim().split(' ')) {
          if (part.startsWith('#')) { // ID
            // only to the first child (in case multiple ones got generated)
            wrapper.firstChild.setAttribute('id', part.substr(1))
          } else if (part.indexOf('=') !== -1) {
            // TODO for attributes?
          } else if (part.startsWith('/')) { // Container class
            Array.from(wrapper.children).forEach(el => el.setAttribute('data-container-class', part.substr(1)))
          } else if (part.startsWith('.')) {
            Array.from(wrapper.children).forEach(el => el.classList.add(part.substr(1)))
          } else {
            Array.from(wrapper.children).forEach(el => el.classList.add(part))
          }
        }
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
