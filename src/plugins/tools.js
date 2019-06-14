
export function walk(node, f) {
  if (node) {
    do {
      let next = node.nextSibling // in case the node gets replaced
      if (node.nodeType === node.ELEMENT_NODE) {
        f.call(node)
        walk(node.firstChild, f)
      }
      node = next
    } while (node)
  }
}

export function walkTextNodes(node, f) {
  if (node) {
    do {
      let next = node.nextSibling // in case the node gets replaced
      if (node.nodeType === node.ELEMENT_NODE) {
        walkTextNodes(node.firstChild, f)
      } else if (node.nodeType === node.TEXT_NODE) {
        f.call(node, node.data, node.parentNode)
      }
      node = next
    } while (node)
  }
}

export function selfAndAll(el, selector) {
  let res = []
  if (el.matches(selector)) res.push(el)
  res = [...res, ...el.querySelectorAll(selector)]
  return res
}

export function replaceNodeByOuterHTMLFragment(node, html) {
  let parent = node.parentNode
  let fragment = node.getRootNode().createElement('div')
  fragment.innerHTML = html
  for (let ch of Array.from(fragment.childNodes)) {
    parent.insertBefore(ch, node)
  }
  parent.removeChild(node)
}
