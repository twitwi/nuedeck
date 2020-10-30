export default () => ({
  name: 'AddSlideKeys',
  /*async*/ enrichSlideDeck(slides) {
    for (let i in slides) {
      let s = slides[i]
      if (s.key === null) {
        s.key = 'slide-' + i
      }
    }
  },
})
