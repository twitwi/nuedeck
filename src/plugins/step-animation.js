
export default () => ({
  name: 'SimpleStep',

  /*sync*/ stepElementToAnimationStep (out, {el, iSlide, iStep, dom}) {
    let attr = (n) => el.getAttribute(`data-${n}`)
    if (!attr('anim')) return

    switch (attr('anim')) {
      case 'add-class': {
        let add = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add(attr('class')))
        let rm = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove(attr('class')))
        out.push({fast: add, doit: add, undo: rm, back: add, el})
        return 'BREAK'
      }
      case 'remove-class': {
        let add = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add(attr('class')))
        let rm = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove(attr('class')))
        out.push({fast: rm, doit: rm, undo: add, back: rm, el})
        return 'BREAK'
      }
      case 'show': {
        let hide = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add('hidden'))
        let show = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove('hidden'))
        let init = attr('noinit') ? ()=>{} : hide
        out.push({init, fast: show, doit: show, undo: hide, back: show, el})
        return 'BREAK'
      }
      case 'hide': {
        let hide = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add('hidden'))
        let show = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove('hidden'))
        let init = attr('noinit') ? ()=>{} : show
        out.push({init, fast: hide, doit: hide, undo: show, back: hide, el})
        return 'BREAK'
      }
    }

  }

})
