
export default () => ({
  name: 'SimpleStep',

  /*sync*/ stepElementToAnimationStep (out, {el, iSlide, iStep, dom}) {

    // TODO consider doing this all the time (for all .steps)
    // ^ this solves the simple step undo issue
    let makeStepCurrent = () => {
      this.forAll('.step, .current-step', clear => clear.classList.remove('current-step', 'current-step-exact'), dom)
      let cur = el
      cur.classList.add('current-step-exact')
      while (! cur.parentNode.classList.contains('slide')) {
        cur.classList.add('current-step')
        cur = cur.parentNode
      }
    }

    out.push({
      isSimple: true,
      // init:,
      fast: makeStepCurrent,
      doit: makeStepCurrent,
      // undo:,
      back: makeStepCurrent,
    })

    // Could: return 'BREAK'
    // as it is intended to be last anyway,
    // not doing it just in case a plugin would like to plug after it.
  }

})
