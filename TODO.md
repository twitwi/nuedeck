# General

- [x] TODO animations, always play first anim (already the case?), fix simple things (undo etc), allow "{merge:true}" to merge with next

- [x] TODO use inject/provide https://vuejs.org/v2/guide/components-edge-cases.html to simplify how addin/addons/slides are written

- [ ] TODO new, goto ui

- [ ] TODO new, add @chunk to load from file (either toplevel or in a slide, as before)

- [ ] TODO new, slide sorter

- [ ] TODO new, help area

- [ ] TODO new, clone system and ui, with log system too (think about nicer format)

- [ ] TODO can we unwrap all (except explicit) paragraphs in ul/li (or find a way to make showdown not generate paragraphs)

- [ ] TODO check that nesting lists with 2 spaces does (or rather does not) work

- [ ] TODO other anims, like follow path (maybe using composite transform)

- [ ] TODO performance, debug

- [ ] TODO performance, test caching a list of plugins per callback type (to avoid iterating all everytime)

- [ ] TODO properly handle options

- [ ] TODO options, make an option to actually do process other types (other than md, for markdown-extra, markdown-math, markdown-suffixes, ...

- [ ] TODO enrich-svg, options, allow disabling features ... low priority

- [ ] TODO options, math delimiters in markdown-math ... low priority

- [ ] TODO real starter/tester file (index.html)

- [x] TODO make anim chainable with data-merge-next

- [ ] TODO header to define pre-step (first) animation, also allow steps (animations) that are done before any anim (and don't count as step)

- [ ] TODO TOC and overview plugin to generate all these

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
