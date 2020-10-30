import { startsWithIgnoreCase, RESTRIM } from './tools'

let functions = {}
let $p = {}

export default () => ({
  name: 'MarkdownEval',

  async enrichGeneratedSlidesHeader({ headerLines, vm, innerID }) {
    await vm.asyncCallAllPlugins('registerEvalHeaderFunctions', functions, vm)

    let i = 0

    while (i < headerLines.length) {
      let l = headerLines[i]
      if (startsWithIgnoreCase(l, '@EVAL-HEADER:')) {
        try {
          let functionKeys = Object.keys(functions)
          let f = new Function('nd', 'ID', '$o', '$p', ...functionKeys, RESTRIM())
          let ID = innerID
          let $o = this.userDataDollarO
          let res = f(this, ID, $o, $p, ...functionKeys.map(k => functions[k]))
          if (Array.isArray(res)) {
            headerLines.splice(i, 1, ...res)
            i += res.length
          } else {
            i++
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('ERROR in @eval-header:', RESTRIM(), e)
          i++
        }
      } else {
        i++
      }
    }
  },
})
