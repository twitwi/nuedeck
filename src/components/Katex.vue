<script>
// Taken from https://github.com/lucpotage/vue-katex
// renamed
import katex from 'katex'
export default {
  name: 'Katex',
  inject: { nd: 'nd' },
  props: {
    expression: {
      type: String,
      default: '',
      required: true,
    },
    displayMode: {
      type: Boolean,
      default: false,
    },
    throwOnError: {
      type: Boolean,
      default: false,
    },
    errorColor: {
      type: String,
      default: '#cc0000',
    },
    macros: {
      type: Object,
      default: null,
    },
    colorIsTextColor: {
      type: Boolean,
      default: false,
    },
    maxSize: {
      type: Number,
      default: Infinity,
    },
    maxExpand: {
      type: Number,
      default: 1000,
    },
    allowedProtocols: {
      type: Array,
      default: () => ['http', 'https', 'mailto', '_relative'],
    },
    strict: {
      type: [Boolean, String, Function],
      default: 'warn',
    },
  },
  computed: {
    options() {
      return Object.assign(
        {},
        {
          displayMode: this.displayMode,
          throwOnError: this.throwOnError,
          errorColor: this.errorColor,
          macros: this.macros,
          colorIsTextColor: this.colorIsTextColor,
          maxSize: this.maxSize,
          maxExpand: this.maxExpand,
          allowedProtocols: this.allowedProtocols,
          strict: this.strict,
        }
      )
    },
    math() {
      let expr = this.expression
      if (expr.length >= 2 && expr[0] == '`' && expr[expr.length - 1] == '`') {
        expr = expr.substr(1, expr.length - 2)
        // TODO: if this kind of use is widespread accross extensions, accessing markdown-eval stuff can become necessary... and markdown-eval might need to store $f etc in a share-able space (maybe import an eval function)
        // NB: not sure why $_ is necessary but ${ gets interpreted before reaching here so $_{ ...
        let f = new Function('nd', '$o', 'return `' + expr.replace(/\$_\{/g, '${').replace(/`/g, '\\`') + '`')
        let nd = this.nd
        let $o = nd.userDataDollarO
        expr = f(nd, $o)
      }
      return katex.renderToString(expr, this.options)
    },
  },
  render(h) {
    const element = this.displayMode ? 'div' : 'span'
    return h(element, {
      domProps: {
        innerHTML: this.math,
      },
    })
  },
}
</script>
