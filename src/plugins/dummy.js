
function log() {
  console.log('DUMMY:', ...arguments)
}

export default () => ({
  name: 'Dummy',
  // "this" will be the Vue object
  init ({registerAction, setOption}, ...more) { log('init', ...more) }, // when the vue object is created
  mounted (...more) { log('mounted', ...more) }, // when the vue component is mounted in the DOM

  //
  generateSlides(slide, contentNode, out, ...more) { log('generateSlides', ...more) },
  enrichSlides(type, body, ...more) { log('enrichSlides', ...more) },
})
