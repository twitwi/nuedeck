export default () => ({
  name: 'LiByLi',
  /*async*/ enrichSlideDeck(slides) {
    for (let s of slides) {
      let filter = '[data-root].libyli:not(.no-libyli)'
      let sel = filter + '>*>li:nth-of-type(n+1)'
      let cls = 'step'
      s.contentElement.querySelectorAll(sel).forEach(el => el.classList.add(cls))
    }
  },
})
