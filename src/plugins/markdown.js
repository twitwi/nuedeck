
import showdown from 'showdown'
import showdownKatex from 'showdown-katex'

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
    let slideSizes = lines.map((e, i)=>[e, i]).filter(([e,])=>e.match(/^##*/)).map(([,i], j, l) => j==0 ? i : i - l[j-1][1])
    for (let s of slideSizes) {
      slides.push(lines.splice(0, s))
    }
    slides.push(lines)
    slides = slides.map(l=>l.join('\n')).filter(s => s.trim().length > 0)
  }

  let converter = new showdown.Converter({
    extensions: [
      showdownKatex({
        delimiters: [
          { left: "$", right: "$", display: true }
        ]
      })
    ]
  })
  converter.setOption('noHeaderId',  true),
  converter.setOption('literalMidWordUnderscores', true)
  converter.setOption('disableForced4SpacesIndentedSublists', true)
  converter.setOption('simpleLineBreaks', true)

  let res = []
  for (let sraw of slides) {
    let html = converter.makeHtml(sraw)
    let parser = new DOMParser()
    let wrapper = parser.parseFromString('<section>'+html+'</section>', 'text/html').body

    await vm.asyncCallAllPlugins('enrichGeneratedSlides', {type: 'md', body: wrapper})

    Array.from(wrapper.children).forEach(s => {
      res.push({
        contentElement: s,
        key: s.getAttribute('id')
      })
    })
  }
  return res
}

export default () => ({
  name: 'Markdown',

  async generateSlides(slide, contentNode, out) {
    if (slide.getAttribute('data-type') === 'html') {
      // html slides
      let o = Array.from(contentNode.children).map( el => ({
        contentElement: el
      }))
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
