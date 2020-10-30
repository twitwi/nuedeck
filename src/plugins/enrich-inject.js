export default () => ({
  name: 'Inject',
  /*async*/ enrichSlideDeck(slides) {
    for (let i in slides) {
      let content = slides[i].contentElement
      let pre = content.getAttribute('data-inject-prefix') || ''
      let suf = content.getAttribute('data-inject-suffix') || ''
      if (pre + suf !== '') {
        content.innerHTML = pre + content.innerHTML + suf
      }
    }
  },
})
