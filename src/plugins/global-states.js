export default () => ({
  name: 'GlobalStates',
  init({ registerAction }) {
    // event bus from key bindings
    registerAction('toggleHelpArea', () => {
      this.toggleCssMode('with-helparea')
    })
    registerAction('toggleAnnotator', () => {
      this.toggleCssMode('with-annotator')
    })
    registerAction('toggleComments', () => {
      this.toggleCssMode('with-comments')
    })
    registerAction('toggleSlideSorter', () => {
      if (this.hasMode('sorter')) {
        this.toggleMode('sorter')
        this.toggleMode('fit') // somewhat hard-coded default fit... (see other instances of the same comment)
        return
      }
      this.toggleMode('fit') // somewhat hard-coded default fit... (see other instances of the same comment)
      this.toggleMode('loading')
      setTimeout(() => {
        this.toggleMode('loading')
        this.toggleMode('sorter')
      }, 0)
    })
  },
})
