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
            sources: '.nd-source'
          }
        },
        skipPlugins: [],
      }
    }
  }
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
    this.L(this.opts.core.selectors.sources)
    this.forAll(this.opts.core.selectors.sources, (slide) => {
      let o = Array.from(slide.content.children).map( el => ({
        contentTemplate: el.outerHTML
      }))
      this.slides.splice(0, 0, ...o)
    })
    this.L(this.slides)
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
