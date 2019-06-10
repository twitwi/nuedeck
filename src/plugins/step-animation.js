
export default () => ({
  name: 'SimpleStep',

  /*sync*/ stepElementToAnimationStep (out, {el, iSlide, iStep, dom}) {
    let attr = (n) => el.getAttribute(`data-${n}`)
    if (!attr('anim')) return

    switch (attr('anim')) {
      case 'add-class': {
        let add = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add(attr('class')))
        let rm = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove(attr('class')))
        out.push({fast: add, doit: add, undo: rm, back: add})
        return 'BREAK'
      }
      case 'remove-class': {
        let add = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add(attr('class')))
        let rm = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove(attr('class')))
        out.push({fast: rm, doit: rm, undo: add, back: rm})
        return 'BREAK'
      }
    }

  }

})
