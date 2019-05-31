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
      <hr/>
      {{ i }}
      ----- ===== ----- TODO find a way to alias $parent (at least)
      <br/>
      <component :is="{ template: s.contentTemplate }"></component>
    </div>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
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

/*
export let defaultOptions = {
  skipPlugins: [],
  selectors: {
    core: {
      container: '#nd-container',
      sources: '.nd-source'
    }
  }
}
*/
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
            sourceTypeMarkdown: '.smart'
          }
        },
        skipPlugins: [],
      }
    }
  }
}

function makeSlidesFromMarkdown (contentNode) {
  let content = [].map.call(contentNode.childNodes, x => x.nodeType === x.TEXT_NODE ? x.textContent : x.outerHTML).join('')

  window.content = content
  // TODO make this optionnal and even metadata configurable (tricky in some sense)
  { // remove trailing spaces
    let lines = content.split('\n')
    let spaces = lines.filter( l => l.trim().length > 0).map( l => l.length - l.replace(/^ */, '').length)
    let remove = spaces.reduce((x,y)=>Math.min(x,y))
    content = lines.map(l => l.substr(remove)).join('\n')
  }

  let converter = new showdown.Converter()
  converter.setOption('literalMidWordUnderscores', true)
  converter.setOption('disableForced4SpacesIndentedSublists', true)
  converter.setOption('simpleLineBreaks', true)
  let html = converter.makeHtml(content);

  tools.L(html)

  return [
    {contentTemplate: `<div>${html}</div>` }
  ]
}


let vmopts = {
  name: 'nuedeck',
  mixins: [defaultMixin],
  data () {
    return {
      slides: [],
      currentSlide: 0,
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
      if (slide.matches(S.sourceTypeMarkdown)) {
        allNew = [...allNew, ...makeSlidesFromMarkdown(slide.content)]
      } else { // default html
        let o = Array.from(slide.content.children).map( el => ({
          contentTemplate: el.outerHTML
        }))
        allNew = [...allNew, ...o]
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
