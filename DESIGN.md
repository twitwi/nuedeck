

## Main principles

- All nd-addon's are copied into nd-container
- All nd-addin's are duplicated in each slide that will be copied in nd-container
- All nd-source's are considered as slides
  - if data-type="html" is specified then each section element is considered a slide,
    and then most of the "markdown magic things" (like animations) can be done
    using specific attributes or elements etc.
  - by default we have markdown slides (see below)
- Markdown sources
  - they can be indented if desired (the common number of space in an nd-source are removed)
  - the slide delimiter is a h1 title (#) or a h2 title (##)
  - each slide can be preceded by some header lines
    - the `@:` can be used to add id (#thing) or classes (name or .name) to the slide itself
      (the generated section) or the container with the / prefix (/name)
    - ...
  - inside the content, there can also be some @... magic things
- What happens when?
  - before the creation of the vue (and after the registration of the embedded plugins),
    window.nuedeckAddPlugins(Vue, plugins) is called if it exists
  - on creation (before any binding to the DOM), `plugins:init` (all `init`
    methods of the plugins are called)
  - just before mounting (into the page) the html title and meta tags (name=...)
    are digested as variables (in this.vars), then `plugins:beforeMount`, then
    keybindings are registered,
    then `asyncBeforeMount` which will generate the actual list of slides
  - `asyncBeforeMount` does a lot
    - for each nd-source, asyncly `plugins:generateSlides` (which ramifies, below)
    - on the result, init empty steps, set data-root=true (TODO: exlain data-root use?)
    - call `plugins:enrichSlideDeck` on the complete deck
    - set this.slides from the modified complete deck --> this will eventually
      trigger the "rendering" of the slides, which will each call (on mounted)
      `slideContentRoot` to inform of what is the actually DOM element
      corresponding to the slide
    - also load the addons and the addins (in this.addons and this.addins)
    - parse the hash to jump to the desired slide
    - NB: plugins can act on a mostly-slide-by-slide level in `generateSlides`
      but also, later, in `enrichSlideDeck` (in which the order of plugins is
      especially important)
  - Some interactions between plugins in `generateSlides` and `enricheSlideDeck`
    - the `markdown` plugin
      - handles markdown nd-source (default ones) (also html as there is nothing to do)
      - it extracts the headers of each slide (remember, # or ## separated)
      - it asyncly `plugins:enrichGeneratedSlidesHeader` that can only change the header
        - here plugins can be stateful, typically `MarkdownSticky`, or not And
          just working on the header `MarkdownAtAnim` or `MarkdownEval` (for @eval-header)
          or `MarkdownExtra`, ...
        - e.g. MarkdownAtAnim rewrites @anim to @inject that is consumed by MarkdownExtra
          which is also the plugin that handles slide @copy
        - e.g. @copy and @inject are transformed by MardownExtra into elements
          that are later interpreted in `enrichGeneratedSlides` (by Enrich and CopySlide)
      - it skips slides that have the `@OFF` header (case insensitive, always)
      - it parses, using MarkdownIt, each slide to html
      - it asyncly `plugins:enrichGeneratedSlides` passing the headers
  - on mounted (asyncly) read option override from CSS, asyncly `plugins:mounted`,
    force jump to current slide and step
  - jumping is async because we might need to wait for the slide to get rendered
    and for its content to be parsed to know the sub-animations, etc, which can
    require async processing (especially, we change the current slide and await
    for vuejs to actually mount it so we can parse its animations)
  - if we jump to a new slide, we will `parseSteps` to know its animations, in any
    case, we will play the proper animation steps, in the proper direction with
    the proper speed, we also update the hash continuously
