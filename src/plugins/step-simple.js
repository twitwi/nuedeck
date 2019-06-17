
export default () => ({
  name: 'SimpleStep',

  /*sync*/ stepElementToAnimationStep (out, {el, iSlide, iStep, dom}) {

    out.push({el, isSimple: true})
    // Could: return 'BREAK' as it is intended to be last anyway,
    // not doing it just in case a plugin would like to plug after it.
  }

})
