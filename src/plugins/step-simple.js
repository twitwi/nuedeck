
export default () => ({
  name: 'SimpleStep',

  /*sync*/ stepElementToAnimationStep (out, {el, iSlide, iStep, dom}) {
    let makeStepCurrent = () => {
      this.L('step', iStep, 'of slide', iSlide)
      this.forAll('.step, .current-step', clear => clear.classList.remove('current-step', 'current-step-exact'), dom)
      let cur = el
      this.L('cur', cur)
      cur.classList.add('current-step-exact')
      while (! cur.parentNode.classList.contains('slide')) {
        cur.classList.add('current-step')
        cur = cur.parentNode
        this.L('cur changed to parent', cur)
      }
      // Could: return 'BREAK'
      // as it is intended to be last anyway,
      // not doing it just in case a plugin would like to plug after it.
    }

    out.push({
      // init:,
      fast: makeStepCurrent,
      doit: makeStepCurrent,
      // undo:,
      back: makeStepCurrent,
    })
  }

})
