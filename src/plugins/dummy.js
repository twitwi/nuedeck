
function log() {
  console.log('DUMMY:', ...arguments)
}

/* eslint-disable */

export default () => ({
  name: 'Dummy',
  // "this" will be the Vue object

  /*sync*/ init ({functions, registerAction, setDefaultOption}, ...more) { log('init', ...more) }, // called when the vue object is created
  /*sync*/ beforeMount (...more) { log('beforeMount', ...more) }, // called on vue beforeMount, not to be overused
  /*async*/ mounted (...more) { log('mounted', ...more) }, // when the vue component is mounted in the DOM
  /*sync*/ stepElementToAnimationStep (out, {el, iSlide, iStep, dom}, ...more) { log('stepElementToAnimationStep', ...more) }, // called for each .step element, to add to "out" an animation for it

  //
  /*async*/ generateSlides(slide, contentNode, out, ...more) { log('generateSlides', ...more) }, // e.g. parse markdown slide
  /*async*/ enrichGeneratedSlides({type, body, headerLines, innerID}, ...more) { log('enrichSlides', ...more) }, // called by slide generator, to allow their direct extension
  /*async*/ enrichGeneratedSlidesHeader({type, headerLines, vm, innerID}, ...more) { log('enrichSlidesHeader', ...more) }, // called by slide generator, to enrich the header, especially to allow to not parse some slides
  /*async*/ enrichSlideDeck(slides, ...more) { log('enrichSlideDeck', ...more) }, // called when all generated slides are there

  //
  /*async*/ registerEvalHeaderFunctions(functions, vm, ...more) { log('registerEvalHeaderFunctions', ...more) }, // to contribute new functions


})
