
export default () => ({
  name: 'CoreFunctions',
  // "this" will be the Vue object

  init ({functions}) {
    // Register functions to be used as e.g. $f.br(...) in the deck.
    // Use arrow functions to keep "this" intact

    functions.br = (v, sep=undefined) => {
      if (sep === undefined) {
        sep = this.opts.core.metadataSeparator
      }
      return v.replace(sep, "<br/>")
    }

    functions.renderShortcut = (k) => {
      let keys = this.opts.keys[k]
      if (keys === undefined) return ''
      return keys.map(v => `<span class="key">${v}</span>`).join(' / ')
    }
  },

  registerEvalHeaderFunctions(functions, vm) {
    // Register functions to be used in @eval-header:

    functions.highlightLi = (i1, i2, cls, noMerge) => {
      let suff = ''
      let mergeSuff = noMerge ? '' : ' data-merge-next'
      if (i2 !== undefined && i2 > 0) suff = `>*>li:nth-child(${i2})`
      if (cls === undefined) cls = 'highlight'
      return [`@inject-end: <span class="step" data-anim="add-class" data-target="[data-root]>*>li:nth-child(${i1})${suff}" data-class="${cls}" ${mergeSuff}></span>`]
    }

    functions.set = (o, k, v) => {
      vm.$set(o, k, v)
      return undefined
    }
  }

})
