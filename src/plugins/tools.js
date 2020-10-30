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

export let endsWith = (longStr, part) => longStr.indexOf(part, longStr.length - part.length) !== -1
let _REST = null
export let REST = () => _REST
let _RESTRIM = null
export let RESTRIM = () => _RESTRIM
export let startsWith = (longStr, part) => {
  let res = longStr.substr(0, part.length) == part
  _REST = res ? longStr.slice(part.length) : null
  _RESTRIM = res ? _REST.replace(/^ */, '') : null
  return res
}
export let startsWithIgnoreCase = (longStr, part) => {
  let res = longStr.substr(0, part.length).toUpperCase() == part.toUpperCase()
  _REST = res ? longStr.slice(part.length) : null
  _RESTRIM = res ? _REST.replace(/^ */, '') : null
  return res
}

export let indexOfIgnoreCase = (arr, part) => {
  let pART = part.toUpperCase()
  for (let i in arr) {
    if (arr[i].toUpperCase() === pART) {
      return i
    }
  }
  return -1
}

export let equalsIgnoreCase = (longStr, part) => {
  return longStr.toUpperCase() === part.toUpperCase()
}

// To avoid eslint warning and unsafe direct access to hasOwnProperty
export let hasOwnProperty = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

// eslint-disable-next-line no-console
export let consoleLog = (...args) => console.log(...args)
