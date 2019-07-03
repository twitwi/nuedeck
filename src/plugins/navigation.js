

export default () => ({
  name: 'Navigation',
  init ({registerAction}) {
    // event bus from key bindings
    registerAction('previousStep', () => {
      if (this.currentStep <= 0) {
        if (this.currentSlide === 0) return
        let sl = this.currentSlide - 1
        let s = this.slides[sl]
        let st = Math.max(0, s.steps.length - 1)
        this.jumpToSlide(sl, st)
      } else {
        this.jumpToSlide(this.currentSlide, this.currentStep - 1)
      }
    })
    registerAction('nextStep', () => {
      let s = this.slides[this.currentSlide]
      if (this.currentStep >= s.steps.length - 1) {
        if (this.currentSlide === this.slideCount - 1) return
        this.jumpToSlide(this.currentSlide + 1, 0)
      } else {
        this.jumpToSlide(this.currentSlide, this.currentStep + 1)
      }
    })
    registerAction('previousEndOfSlide', () => {
      if (this.currentSlide > 0) {
        this.jumpToSlide(this.currentSlide - 1, -1)
      }
    })
    registerAction('nextEndOfSlide', () => {
      let s = this.slides[this.currentSlide]
      if (this.currentStep >= s.steps.length - 1) {
        if (this.currentSlide < this.slides.length - 1) {
          this.jumpToSlide(this.currentSlide + 1, -1)
        }
      } else {
        this.jumpToSlide(this.currentSlide, -1)
      }
    })
    registerAction('previousSlide', () => {
      if (this.currentStep == 0) {
        if (this.currentSlide > 0) {
          this.jumpToSlide(this.currentSlide - 1, 0)
        }
      } else {
        this.jumpToSlide(this.currentSlide, 0)
      }
    })
    registerAction('nextSlide', () => {
      if (this.currentSlide < this.slides.length - 1) {
        this.jumpToSlide(this.currentSlide + 1, 0)
      }
    })
    registerAction('popupJumpToSlide', () => {
      let res = prompt('Enter slide number to jump to:', this.currentSlide + 1)
      if (res == null) return
      this.jumpToSlide(parseInt(res) - 1, 0)
    })
    registerAction('popupJumpToSlide0Based', () => {
      let res = prompt('Enter slide number to jump to:', this.currentSlide)
      if (res == null) return
      this.jumpToSlide(parseInt(res), 0)
    })
    registerAction('showSlideSorter', () => {
      if (this.mode === 'sorter') {
        this.mode = 'fit'
        return
      }
      this.mode = 'loading'
      setTimeout(() => {
        this.mode = 'sorter'
      }, 0)
    })
  }
})
