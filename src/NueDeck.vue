<template>
  <div class="nuedeck">
    {{ opts }}
    <button @click="currentSlide--">«</button>
    <button @click="currentSlide++">»</button>
    <br/>
    <div v-for="[s,i] in slidesToRender"
         :key="'S'+i"
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
      <component v-for="(a,ai) in addins"
      :key="'S'+i+'A'+ai"
      :is="{
          data: ((d) => () => ({ ...d, renderSlide: i }))($data), // pass a copy of data (test for performance)
          template: a.contentTemplate }"></component>
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
            addins: '.nd-addin',
            sourceTypeHtml: '.html'
          },
          // eslint-disable-next-line
          metadataSeparator: /(&nbsp;| )/gi,   /* we need to handle '&nbsp;' and ' ' because in the title, ' ' becomes '&nbsp;' */
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
      addins: [],
      currentSlide: 4,
      vars: {},
    }
  },
  computed: {
    // TODO: check that it is actually useful in terms of perf to select the default
    slidesToRender () {
      let start = Math.max(0, this.currentSlide - 1)
      let end = Math.min(this.currentSlide + 2, this.slides.length)
      return this.slides.map((s,i) => [s, i]).slice(start, end)
    },
    slideCount () {
      return this.slides.length
    }
  },
  beforeMount () {
    let S = this.opts.core.selectors
    { // Get HTML metadata into variables
      let app = (n, v) => {
        this.vars[n] = v
      }
      app('title', document.querySelector('html>head>title').innerHTML)
      this.forAll('html>head>meta[name]', (e) => {
        app(e.getAttribute('name'), e.getAttribute('content'))
      })
    }
    { // Load slides in different formats
      let allNew = []
      this.forAll(S.sources, (slide) => {
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
    }
    { // Load addins (to be added to every slide)
      let allNew = []
      this.forAll(S.addins, (slide) => {
        let o = Array.from(slide.content.children).map( el => ({
          contentTemplate: el.outerHTML
        }))
        allNew = [...allNew, ...o]
      })
      this.addins.splice(0, 0, ...allNew)
    }
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
    },
    br (v) {
      return v.replace(this.opts.core.metadataSeparator, "<br/>")
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
