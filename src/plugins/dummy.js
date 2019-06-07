
function log() {
  console.log('DUMMY:', ...arguments)
}

export default () => ({
  name: 'Dummy',
  // "this" will be the Vue object
  /*sync*/ init ({registerAction, setOption}, ...more) { log('init', ...more) }, // called when the vue object is created
  /*sync*/ beforeMount (...more) { log('beforeMount', ...more) }, // called on vue beforeMount, not to be overused
  /*async*/ mounted (...more) { log('mounted', ...more) }, // when the vue component is mounted in the DOM

  //
  /*async*/ generateSlides(slide, contentNode, out, ...more) { log('generateSlides', ...more) }, // e.g. parse markdown slide
  /*async*/ enrichGeneratedSlides(type, body, ...more) { log('enrichSlides', ...more) }, // called by slide generator, to allow their direct extension
  /*async*/ enrichSlideDeck(body, ...more) { log('enrichSlideDeck', ...more) }, // called when all generated slides are there

  //

})
