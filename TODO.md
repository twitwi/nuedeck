# General

- [x] TODO animations, always play first anim (already the case?), fix simple things (undo etc), allow "{merge:true}" to merge with next

- [x] TODO use inject/provide https://vuejs.org/v2/guide/components-edge-cases.html to simplify how addin/addons/slides are written

- [x] TODO @eval-header: nd.highlightLi(4, 1) (but allow global custom functions, or plugins ones)... this parser is header time

- [x] TODO markdown shortcuts for animations (simple ones)

- [x] TODO switch to mardown-it (robust, faster, 2 spaces) (nesting lists with 2 spaces did not work) motivated partly by https://github.com/showdownjs/showdown/issues/367 https://www.reddit.com/r/Notable/comments/bzwgia/another_update_on_v160/

- [x] TODO review and fix @anim continuation and @anim in @inject

- [x] TODO bookmarkable URLs (solves: have live reload stay on the same slide)

- [x] TODO URLs consider using 1-based slide numbers by default as it is more user friendly -> #s:1 and #S:0 (steps are always 0 based though)

- [ ] **TODO** real starter/tester file (index.html)

- [ ] make a "starterkit" repo (from the starter file)

- [x] TODO make the readme decent

- [ ] TODO small doc on how we can write plugins, from simple components (what constraints?) to more coding stuff

- [x] TODO consider https://www.npmjs.com/package/markdown-it-span at least when we want to wrap something (like math) to style it etc (instead of *truc*) -> the plugin is buggous (breaks @copy:, http:// etc) see https://github.com/pnewell/markdown-it-span/issues/1 and the link to how to actually make a plugin that works better

- [x] TODO new, goto ui, minimalist for now (just a prompt)

- [ ] **TODO** TOC and overview plugin to generate all these, consider https://www.npmjs.com/package/markdown-it-toc-and-anchor OR https://www.npmjs.com/package/markdown-it-toc-done-right

- [ ] TODO make it possible for some of the links to pushState into the history

- [ ] **TODO** new, add @chunk to load from file (either toplevel or in a slide, as before)

- [x] TODO simple slide sorter

- [x] TODO slide sorter: todo need to extract style (and maybe consider refactoring)  -> integrated in the theme without much effort for now

- [ ] TODO slide sorter/mode: consider having URL variables for that

- [ ] TODO new, help area

- [ ] TODO help area: consider allowing live tuning of CSS vars

- [ ] TODO performance, debug of over-refresh by vue

- [ ] **TODO** new, clone system and ui, with log system too (think about nicer format)

- [ ] TODO enable https://github.com/markdown-it/markdown-it-container and make it easily extensible from nuedeck

- [ ] TODO redev a markdown-it-span (see above)

- [x] TODO kept both @:.... suffixes (non-advertised) and preferred https://www.npmjs.com/package/markdown-it-attrs (it is perfect in some sense but has no container-styling, needs .classname, etc, but it can be done with data-container-styling=....)

- [ ] TODO ui, as in the previous, ui elements could be added automatically unless they are present in the template (e.g. goto ui, etc)

- [ ] **TODO** @eval-header: should use functions, provided by plugins, that are in nd but not directly in nd (in a subobject rather), there should be a suffix to eval something, in a slide, coming from "my" (but should be parse time or something)... we need a namespace for functions, a namespace of eval-header variables (parse time, non reactive, but how to make them frozen in the slide? tips: @eval-header: my.thmlot = my.th++, but we might want something local my[currentSlide].thmlot = my.th++) and a namespace that may exist at parse time but that is meant to be there later and be reactive -> my? (the previous could be a convention, like my.parse as in my.parse.th++)

- [ ] TODO can we unwrap all (except explicit) paragraphs in ul/li (or find a way to make showdown not generate paragraphs)

- [ ] TODO other anims, like follow path (maybe using composite transform), consider also https://animejs.com/ as a base, and more precisely https://animejs.com/documentation/#motionPath for the path anim

- [ ] TODO performance, test caching a list of plugins per callback type (to avoid iterating all every time)

- [ ] TODO properly handle options across the whole project

- [ ] TODO options, make an option to actually do process other types (other than md, for markdown-extra, markdown-math, markdown-suffixes, ...

- [ ] TODO enrich-svg, options, allow disabling features ... low priority

- [ ] TODO options, math delimiters in markdown-math ... low priority

- [ ] TODO consider all plugins for markdown-it https://www.npmjs.com/search?q=keywords%3Amarkdown-it-plugin&page=2&perPage=20

- [x] TODO make anim chainable with data-merge-next

- [x] TODO generic @inject:, to inject at the top of the slide... solves, for now: header to define pre-step (first) animation, also allow steps (animations) that are done before any anim (and don't count as step)

- [x] TODO, @for-copy (something like @off (maybe @unshown) but that allow @copy (to later remove the slide (in an enrich-), e.g. for the overview that we copy))

- [x] TODO ^...  data-for-copy="true" (might be useful on non-markdown slides too... should add a header (same syntax in an element) in html too (and call the enricher there also))

- [ ] TODO LocalStyle.vue, make it actually local? + allow it to be in the nd-source not in a slide
      the simplest solution is probably to tag all elements from a nd-source with the same class (or better to allow a classname on the nd-source, that is added to all and the locality is the user's problem, until scoped css are standard)

- [ ] TODO somewhere, add a header like @animSystematicReplayOnBack... low priority unless an useful example is found

- [ ] TODO markdown, make removal of trail spaces optional and even metadata configurable (tricky in some sense)... low priority

- [ ] TODO autofit, handle other fit modes... low priority

- [ ] TODO in this, the br is needed.... unless there are not the following bullets: (report to showdown?)

~~~
# Optimizing the $F_\beta$-measure
- Reminder @:padli densemath
  - Precision: $prec=\frac{TP}{TP+FP}$
  - Recall: $rec=\frac{TP}{P} = \frac{TP}{TP+FN}$
  - $F_\beta$-measure: $F_\beta = (1+\beta^2)\frac{prec\cdot rec}{\beta^2 \cdot prec + rec}$
- **Non-separability**, i.e.    $F_\beta \ne \sum_{(x_i, y_i) \in S}...$
  <br/>*NB: accuracy is separable, $acc = \sum_{(x_i, y_i) \in S} \frac{1}{m} \delta(y_i - \hat{y_i})$ @:denser*
  - ⇒ The loss for one point depends on the others
  - ⇒ Impossible to optimize directly
  - ⇒ Impossible to optimize on a subset (minibatch)
~~~

# custom-release.sh

- [ ] TODO should rewrite katex css to look online also (maybe reuse the theme-builder script)

- [ ] TODO also produce a font pack zip with katex and all styles
