<template>
  <div class="nuedeck">
    {{ opts }}
    <button @click="currentSlide--">«</button>
    <button @click="currentSlide++">»</button>
    <br/>
    <div v-for="[s,i] in slidesToRender"
         :key="i"
         :class="slideClasses(s, i, currentSlide)"
         :style="{ NOdisplay: i==currentSlide ? undefined : 'none'}">
      <hr/>
      <hr/>
      {{ i }}
      <hr/>
      <!-- TODO find a way to alias $parent (at least, and test perf of the current solution) -->
      <br/>
      <!-- another solution props: {state: {default:$data}} -->
      <component :is="{
        data: ((d) => () => d)($data), // pass a copy of data (test for performance)
        template: s.contentTemplate }"></component>
    </div>
  </div>
</template>

<script>

import showdown from 'showdown'

let tools = {
  L () {
    console.log(...['LOG:', ...arguments])
  },
  forAll (sel, f, base=document) {
    base.querySelectorAll(sel).forEach(f)
  }
}

export let defaultMixin = {
  data () {
    return {
      opts: {
        core: {
          classes : {
            slide: 'slide',
            currentSlide: 'current-slide'
          },
          selectors: {
            container: '#nd-container',
            sources: '.nd-source',
            sourceTypeHtml: '.html'
          }
        },
        skipPlugins: [],
      }
    }
  }
}

function makeSlidesFromMarkdown (contentNode) {
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

  let converter = new showdown.Converter()
  converter.setOption('literalMidWordUnderscores', true)
  converter.setOption('disableForced4SpacesIndentedSublists', true)
  converter.setOption('simpleLineBreaks', true)

  return slides.map(s => ({
    contentTemplate: `<div>${ converter.makeHtml(s) }</div>`
  }))
}


let vmopts = {
  name: 'nuedeck',
  mixins: [defaultMixin],
  data () {
    return {
      slides: [],
      currentSlide: 2,
    }
  },
  computed: {
    // TODO: check that it is actually useful in terms of perf to select the default
    slidesToRender () {
      let start = Math.max(0, this.currentSlide - 1)
      let end = Math.min(this.currentSlide + 2, this.slides.length)
      return this.slides.map((s,i) => [s, i]).slice(start, end)
    }
  },
  beforeMount () {
    let S = this.opts.core.selectors
    let allNew = []
    // Load slides in different formats
    this.forAll(S.sources, (slide) => {
      this.L(slide.content)
      if (slide.matches(S.sourceTypeHtml)) {
        // html slides
        let o = Array.from(slide.content.children).map( el => ({
          contentTemplate: el.outerHTML
        }))
        allNew = [...allNew, ...o]
      } else { // default, smart
        allNew = [...allNew, ...makeSlidesFromMarkdown(slide.content)]
      }
    })
    this.slides.splice(0, 0, ...allNew)
    this.L(JSON.parse(JSON.stringify(this.slides)))
  },
  mounted () {
  },
  methods: {
    ...tools,
    slideClasses (s, i, currentSlide) {
      let res = [this.opts.core.classes.slide]
      {
        let n = i - currentSlide
        let suffix = ""
        if (n > 0) {
          suffix = '-p' + n
        } else if (n < 0) {
          suffix = '-m' + (-n)
        }
        res.push(this.opts.core.classes.currentSlide + suffix)
      }
      return res
    }
  }
}

export default vmopts


</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
