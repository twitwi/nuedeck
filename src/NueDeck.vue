<template>
  <div class="nuedeck" ref="nuedeck">
   <div class="fit" ref="fit">
    <div v-for="[s,i] in slidesToRender"
         :key="'S'+i"
         :class="slideClasses(s, i, currentSlide)"
         :style="{ display: Math.abs(currentSlide-i)<=2 ? undefined : 'none'}">
      <!-- TODO find a way to alias $parent (at least, and test perf of the current solution) -->
      <!-- another solution props: {state: {default:$data}} -->
      <component :is="{
        mounted () {
          slideContentRoot(i, this.$el)
        },
        data: ((d) => () => d)($data), // pass a copy of data (test for performance)
        template: s.contentTemplate }"></component>
      <component v-for="(a,ai) in addins"
      :key="'S'+i+'A'+ai"
      :is="{
        data: ((d) => () => ({ ...d, renderSlide: i }))($data), // pass a copy of data (test for performance)
        template: a.contentTemplate }"></component>
    </div>
    <component v-for="(a,ai) in addons"
    :key="'A'+ai"
    :is="{
        data: ((d) => () => ({ ...d}))($data), // pass a copy of data (test for performance)
        template: a.contentTemplate }"></component>
   </div>
  </div>
</template>

<script>

import showdown from 'showdown'
import showdownKatex from 'showdown-katex'
// TODO make sure we can run offline etc
import keymage from 'keymage'

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
        keys: {
          previousStep: ['backspace', 'left', 'pgdown'],
          nextStep: ['enter', 'space', 'right', 'pgup'],
          previousSlide: ['up'],
          nextSlide: ['down'],
          previousEndOfSlide: ['a'],
          nextEndOfSlide: ['z'],
        },
        core: {
          classes : {
            slide: 'slide',
            currentSlide: 'current-slide'
          },
          selectors: {
            container: '#nd-container',
            sources: '.nd-source',
            addins: '.nd-addin',
            addons: '.nd-addon',
            sourceTypeHtml: '.html'
          },
          designWidth: 800*1.3, // px
          designHeight: 600, // px
          fitMode: "center middle",
          fitMargin: [0, 0, 0, 0],
          fitDebounce: 200,

          // eslint-disable-next-line
          metadataSeparator: /(&nbsp;| )/gi,   /* we need to handle '&nbsp;' and ' ' because in the title, ' ' becomes '&nbsp;' */
        },
        skipPlugins: [],
      }
    }
  }
}

function processCustomMarkdownConstructs (w) {
  // w is a wrapper (body element actually) that contains the slide content
  // NB: it is a single slide (for now)
  let d = w.getRootNode()
  tools.L(w)

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
  Array.from(w.children).forEach(s => {
    tools.L(s.firstChild)
    if (s.firstChild.tagName.match(/^h1$/i)) {
      if (startsWithIgnoreCase(s.firstChild.textContent, '@COPY:')) {
        var main = RESTRIM.split(/:/);
        var baseSelector = main[0];
        var animPart = main.slice(1).join(':');
        var hasAnim = ! animPart.match(/^\s*$/);
        var base = null;
        s.outerHTML = `<section>TODO DO REPLACE BY ${main}</section>`
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
  slides.forEach(sraw => {
    // TODO: consider promoting it as a showdown extension? might need to handle not single slides but whole content (and do the h1, h2 splitting and allow to not do it)
    // on the model of showdown-katex
    let html = converter.makeHtml(sraw)
    let parser = new DOMParser()
    let wrapper = parser.parseFromString('<section>'+html+'</section>', 'text/html').body
    // TODO: extension point
    processCustomMarkdownConstructs(wrapper)
    Array.from(wrapper.children).forEach(s => {
      res.push({
        contentTemplate: s.outerHTML,
        key: s.getAttribute('id')
      })
    })
  })
  return res
}

function registerKeybindings (vm) {
  if (vm.keyBindingsUnregistering !== undefined) {
    vm.keyBindingsUnregistering.forEach(f => f())
    vm.keyBindingsUnregistering = []
  }
  let keys = vm.opts.keys
  for (let k in keys) {
    // TODO: consider nested objects in keys (for plugins)
    keys[k].forEach(s => keymage(s, ev => vm.$emit(k, ev)))
  }
}

function maybe (obj, possibleAttributeFunction) {
  if (obj[possibleAttributeFunction] === undefined) return () => {}
  return obj[possibleAttributeFunction]
}

let vmopts = {
  name: 'nuedeck',
  mixins: [defaultMixin],
  data () {
    return {
      slides: [],
      addins: [],
      addons: [],
      keyBindings: [],
      keyDocs: {
        // have a helper to register that
        // nameOfTheEvent: { short: "...", long: "......."}
      },
      currentSlide: 7,
      currentStep: 4,
      vars: {},
    }
  },
  watch: {
    slides () {
      this.L('WATCH: slides')
    }
  },
  created () {
    // non-reactive properties
    this.slideContentRoots = {}
    // event bus from key bindings
    this.$on('previousStep', () => {
      if (this.currentStep <= 0) {
        if (this.currentSlide === 0) return
        let sl = this.currentSlide - 1
        let s = this.slides[sl]
        let st = Math.max(0, s.steps.length - 1)
        this.jumpToSlide(sl, st)
      } else {
        this.jumpToSlide(this.currentSlide, this.currentStep - 1)
      }
    })
    this.$on('nextStep', () => {
      let s = this.slides[this.currentSlide]
      if (this.currentStep >= s.steps.length - 1) {
        if (this.currentSlide === this.slideCount - 1) return
        this.jumpToSlide(this.currentSlide + 1, 0)
      } else {
        this.jumpToSlide(this.currentSlide, this.currentStep + 1)
      }
    })
    this.$on('previousEndOfSlide', () => {
      if (this.currentSlide > 0) {
        this.jumpToSlide(this.currentSlide - 1, -1)
      }
    })
    this.$on('nextEndOfSlide', () => {
      let s = this.slides[this.currentSlide]
      if (this.currentStep >= s.steps.length - 1) {
        if (this.currentSlide < this.slides.length - 1) {
          this.jumpToSlide(this.currentSlide + 1, -1)
        }
      } else {
        this.jumpToSlide(this.currentSlide, -1)
      }
    })
    this.$on('previousSlide', () => {
      if (this.currentStep == 0) {
        if (this.currentSlide > 0) {
          this.jumpToSlide(this.currentSlide - 1, 0)
        }
      } else {
        this.jumpToSlide(this.currentSlide, 0)
      }
    })
    this.$on('nextSlide', () => {
      if (this.currentSlide < this.slides.length - 1) {
        this.jumpToSlide(this.currentSlide + 1, 0)
      }
    })
  },
  computed: {
    // TODO: check that it is actually useful in terms of perf to select the default
    slidesToRender () {
      let start = 0 //Math.max(0, this.currentSlide - 1)
      let end = this.slides.length //Math.min(this.currentSlide + 2, this.slides.length)
      return this.slides.map((s,i) => [s, i]).slice(start, end)
    },
    slideCount () {
      return this.slides.length
    },
    stepCount () {
      return this.slides[this.currentSlide].steps.length
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
          allNew = [...allNew, ...makeSlidesFromMarkdown(slide.content, )]
        }
      })
      allNew.forEach(s => {
        if (s.steps === undefined) s.steps = []
      })
      this.slides.splice(0, 0, ...allNew)
    }
    { // Load addons (to be added to the container)
      let allNew = []
      this.forAll(S.addons, (slide) => {
        let o = Array.from(slide.content.children).map( el => ({
          contentTemplate: el.outerHTML
        }))
        allNew = [...allNew, ...o]
      })
      this.addons.splice(0, 0, ...allNew)
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
    registerKeybindings(this)
  },
  mounted () {
    window.vm = this
    this.L('MOUNTED')
    this.optionsOverrideFromCSS()
    this.autofit()
    window.addEventListener('resize', () => {this.autofit()})
    // TMP
    this.$refs.nuedeck.onmouseup = () => {this.autofit()}
    this.jumpToSlide(this.currentSlide, this.currentStep, {sl:-999})
  },
  updated () {
    this.L('UPDATED')
    this.jumpToSlide(this.currentSlide, this.currentStep, {sl:-999})
  },
  methods: {
    ...tools,
    slideContentRoot (i, dom) {
      // TODO: investigate, hard, this seems to be called way too much du to vuejs rerendering a lot...
      // this happens because currentSlide changes => classes for the slides changes => for loop redone... (independant of the use of slidesToRender)
      //this.L('SLIDE CONTENT MOUNTED', i, dom)
      this.L('SLIDE CONTENT MOUNTED')
      this.slideContentRoots[i] = dom
    },
    parseSteps (i, dom) {
      this.L('PARSE STEPS', i)
      let s = this.slides[i]
      let allNew = []
      this.forAll('.step', (el,elind) => {
        allNew.push(() => {
          this.L('step', elind, 'of slide', i)
          this.forAll('.step, .current-step', clear => clear.classList.remove('current-step', 'current-step-exact'), dom)
          let cur = el
          this.L('cur', cur)
          cur.classList.add('current-step-exact')
          while (! cur.parentNode.classList.contains('slide')) {
            cur.classList.add('current-step')
            cur = cur.parentNode
            this.L('cur changed to parent', cur)
          }
        })
      }, dom)
      allNew.push(() => {
        this.forAll('.step, .current-step', el => el.classList.remove('current-step', 'current-step-exact'), dom)
      })
      s.steps.splice(0, s.steps.length, ...allNew)
    },
    jumpToSlide (sl, st, pPrev={}) {
      let prev = {sl: this.currentSlide, st: this.currentStep}
      Object.assign(prev, pPrev)
      this.L(prev, sl, st)
      if (sl < 0) sl = this.slides.length + sl // handle negative slide index
      if (prev.sl !== sl) {
        if (this.slideContentRoots[sl] !== undefined) {
          this.parseSteps(sl, this.slideContentRoots[sl])
        }
      }
      if (st < 0) st = this.slides[sl].steps.length + st // handle negative step index
      if (prev.sl === sl) {
        // we stay in the same slide
        if (prev.st < st) {
          for (let i = prev.st+1; i <= st; i++) {
            // TODO will need to .skip and .doit
            this.slides[sl].steps[i]()
          }
        } else {
          for (let i = prev.st-1; i >= st; i--) {
            // TODO will need to .skip and .doit
            this.slides[sl].steps[i]()
          }
        }
        this.currentStep = st
      } else {
        // we change slide
        this.slides[sl].steps.slice(0, st+1).forEach(f => f())
        this.currentSlide = sl
        this.currentStep = st
      }
    },
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
    autofit () {
      let o = this.opts
      let r = {width: this.$refs.nuedeck.clientWidth, height: this.$refs.nuedeck.clientHeight}
      let m = o.core.fitMargin
      let dw = o.core.designWidth
      let dh = o.core.designHeight
      let sx = r.width / (dw + m[1] + m[3])
      let sy = r.height / (dh + m[0] + m[2])
      let s = Math.min(sx, sy)
      // TODO fit modes
      let tx = m[3] + (r.width/s - (dw + m[1] + m[3])) / 2
      let ty = m[0] + (r.height/s - (dh + m[0] + m[2])) / 2
      this.$refs.fit.style.transform = `translate(-50%,-50%) scale(${s}, ${s}) translate(50%, 50%) translate(${tx}px, ${ty}px)`
    },
    optionsOverrideFromCSS () {
      let st = getComputedStyle(this.$refs.nuedeck)
      let digest = (pre, obj, maxd=10) => {
        if (maxd <= 0) return
        if (obj === undefined) return
        if (typeof obj === 'string') return
        for (let att of Object.keys(obj)) {
          let k = pre+att
          let v = st.getPropertyValue(k)
          if (v !== '') {
            this.L('CSS variable', k, 'replaces options value', obj[att], 'by', eval(v))
            obj[att] = eval(v)
          } else {
            digest(`${k}-`, obj[att], maxd-1)
          }
        }
      }
      digest('--nuedeck-', this.opts)
    },
    // TODO: maybe separate what is meant to be used like these?
    br (v, sep=undefined) {
      if (sep === undefined) {
        sep = this.opts.core.metadataSeparator
      }
      return v.replace(sep, "<br/>")
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
