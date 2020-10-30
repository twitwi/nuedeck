export default () => ({
  name: 'SimpleStep',

  /*sync*/ stepElementToAnimationStep(out, { el, dom }) {
    let attr = n => el.getAttribute(`data-${n}`)
    if (!attr('anim')) return

    let push = o =>
      out.push({
        mergeNext: attr('merge-next') !== null,
        el,
        ...o,
      })

    switch (attr('anim')) {
      case 'add-class': {
        let add = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add(attr('class')))
        let rm = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove(attr('class')))
        push({ fast: add, doit: add, undo: rm, back: add })
        return 'BREAK'
      }
      case 'remove-class': {
        let add = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add(attr('class')))
        let rm = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove(attr('class')))
        push({ fast: rm, doit: rm, undo: add, back: rm })
        return 'BREAK'
      }
      case 'show': {
        let hide = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add('hidden'))
        let show = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove('hidden'))
        let init = attr('noinit') ? () => {} : hide
        push({ init, fast: show, doit: show, undo: hide, back: show })
        return 'BREAK'
      }
      case 'hide': {
        let hide = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.add('hidden'))
        let show = () => dom.querySelectorAll(attr('target')).forEach(e => e.classList.remove('hidden'))
        let init = attr('noinit') ? () => {} : show
        push({ init, fast: hide, doit: hide, undo: show, back: hide })
        return 'BREAK'
      }
    }
  },
})
