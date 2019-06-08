
import SVGInjector from 'svg-injector'

async function svgInject(singleSVG, options) {
  return new Promise(resolve => {
    SVGInjector(singleSVG, {
      ...options,
      each (svg) {
        if (options.each) options.each(svg)
        resolve()
      }
    })
  })
}

function walk(node, f) {
  if (node) {
    do {
      if (node.nodeType === node.ELEMENT_NODE) {
        f.call(node)
        walk(node.firstChild, f)
      }
      node = node.nextSibling
    } while (node)
  }
}

// TODO actually allow disabling  features?
/*
function notDisabled(k) {
    let kk = 'no'+k;
    let disabled = false
    disabled |= (attributes[kk] && attributes[kk] == "true")
    disabled |= $(obj).filter(opts.selectors.svgObjectDisable[k]).length > 0
    return !disabled;
}
*/

function styleToAttributes(svg) {
  walk(svg, function() {
    let st = this.getAttribute('style')
    if (st) {
      st.trim().split(/ *; */).forEach( style => {
        if (style && style.substring(0,1) !== '-') {
          let s = style.trim().split(/ *: */);
          this.setAttribute(s[0], s[1])
        }
      })
    }
    this.removeAttribute('style')
  })
}

let nextId = 1
function generateId(/*oldId*/) {
  let id = 'uniquesvg' + nextId
  nextId++
  return id
}

let referencingAttributes = ["clip-path", "color-profile", "fill", "filter", "marker-start", "marker-mid", "marker-end", "mask", "stroke"]

function makeReferencedIdsUnique(svg) {
  let byId = {}
  let referencersIds = {}
  let pushAdd = function(k, o) {
    if (referencersIds[k]) {
      referencersIds[k].push(o)
    } else {
      referencersIds[k] = [o]
    }
  }
  // gather all ids and references
  walk(svg, function() {
    let id = this.id
    if (id) {
      byId[id] = this
    }
    for (let attr in referencingAttributes) {
      let val = this.getAttribute(attr)
      if (val) {
        let groups = val.trim().match(/^url\(#(.+?)\)$/)
        if (groups) pushAdd(groups[1], {o:this, a:attr})
      }
    }
    var xlink = this.getAttribute('xlink:href')
    if (xlink) {
      var groups = xlink.trim().match(/^#(.+?)$/)
      if (groups) pushAdd(groups[1], {o:this, a:'xlink:href'})
    }
  })
  // patch used ids and references (keep unreferenced ids fixed (to allow for identification from the editor to the css, even if classes should be preferred))
  let newIds = {}
  for (let id in referencersIds) {
    let newId = generateId(id)
    byId[id].id = newId
    newIds[id] = newId
    byId[id].classList.add(`idwas-${id}`)
  }
  for (let id in referencersIds) {
    let newId = newIds[id]
    let refs = referencersIds[id]
    for (let pair of refs) {
      let prev = pair.o.getAttribute(pair.a)
      let now = prev.replace('#' + id, '#' + newId)
      if (prev !== now)
      if (pair.a === 'xlink:href') {
        pair.o.setAttributeNS('http://www.w3.org/1999/xlink', 'href', now)
      } else {
        pair.o.setAttribute(pair.a, now)
      }
    }
  }
}

function patchSVG(img) { return function(svg) {
  console.log(img, svg)
  img.removeAttribute('src')
  let stretch = false
  let styleRewrite = true
  let idRewrite = true
  let propagateImgAttributes = true

  let vb = svg.getAttribute('viewBox') //.viewBox.animVal
  if (vb === null) {
    let units = {
      '': 1,
      px: 1,
      cm: 96/2.54,
      mm: 96/10/2.54,
      Q:  96/40/2.54,
      in: 96,
      pc: 96/6,
      pt: 96/72,
    }
    let px = (str) => {
      // see https://www.w3.org/TR/css3-values/#absolute-lengths
      var parts = str.split(/^([\d.]+)/).slice(1)
      return parseFloat(parts[0]) * units[parts[1]]
    }
    let w = svg.getAttribute('width')
    let h = svg.getAttribute('height')
    vb = `0 0 ${px(w)} ${px(h)}`
    svg.setAttribute('viewBox', vb)
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  if (stretch) {
    svg.setAttribute('preserveAspectRatio', 'none')
  }
  if (styleRewrite) {
    styleToAttributes(svg)
  }
  if (idRewrite) {
    makeReferencedIdsUnique(svg)
  }
  if (propagateImgAttributes) {
    for (let a of img.getAttributeNames()) {
      svg.setAttribute(a, img.getAttribute(a))
    }
  }
}}


export default () => ({
  name: 'SVG',

  async enrichSlideDeck(slides) {
    // TODO: could do it parallel
    for (let s of slides) {
      let toInject = s.contentElement.querySelectorAll(this.opts.core.selectors.svg)
      // TODO: here also could do it in parallel
      for (let singleSVG of toInject) {
        await svgInject(singleSVG, {each: patchSVG(singleSVG) })
      }
    }
  }
})
