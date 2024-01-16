const customSlider = (name, opts) => {
	const slider = document.querySelector(`.${name}`)
	const sliderWrapper = slider.querySelector('.slider-wrapper')
	const slides = Array.from(sliderWrapper.children)
	const duration = opts.duration

	const arrowLeft = slider.querySelector(`.${opts.navigation.left}`)
	const arrowRight = slider.querySelector(`.${opts.navigation.right}`)

	let slidesInView = opts.slidesInView

	const firstVisibleIndex = (totalSlides, visibleSlides, duplicates) => {
		if (totalSlides < visibleSlides || duplicates < 0) {
			console.log('Total slides less than visible slides')
			return
		}
		return Math.floor((totalSlides + duplicates * 2 - visibleSlides) / 2)
	}

	let slideIndex = firstVisibleIndex(
		slides.length,
		slidesInView,
		Math.floor(slides.length / 2)
	)

	let isMoving = false
	let cloneIndex = slideIndex

	const cloneSlides = () => {
		let cloneCount = Math.floor(slides.length / 2)

		for (let i = 0; i <= cloneCount - 1; i++) {
			const clone = slides[i].cloneNode(true)
			sliderWrapper.appendChild(clone)
		}

		for (let i = cloneCount; i >= 1; i--) {
			const clone = slides[slides.length - i].cloneNode(true)
			sliderWrapper.insertBefore(clone, slides[0])
		}
	}

	const setSlidesBase = () => {
		const rect = sliderWrapper.getBoundingClientRect()
		const sliderWidth = rect.width
		const slides = Array.from(sliderWrapper.children)

		slides.map((slide) => {
			slide.style.width = `${sliderWidth / slidesInView}px`
			slide.style.transition = `transform ${duration}ms ease-in-out`
		})
	}

	const applyTransform = (slide, opts) => {
		slide.style.transform = `
        translate3d(0rem, 0rem, -${opts.translateZ}rem)
        rotateY(${opts.rotateY}deg)
        scale(${opts.scale})
    `
	}

	const transformSlides = (slides) => {
		const transformConfig = {
			default: { translateZ: 0, rotateY: 0, scale: 1.19 },
			prev: { translateZ: 10, rotateY: 42.5, scale: 1.19 },
			active: { translateZ: 0, rotateY: 0, scale: 0.955 },
			next: { translateZ: 10, rotateY: -42.5, scale: 1.19 },
		}

		slides.map((slide) => {
			const state = slide.classList.contains('slide-prev')
				? 'prev'
				: slide.classList.contains('slide-active')
				? 'active'
				: slide.classList.contains('slide-next')
				? 'next'
				: 'default'

			applyTransform(slide, transformConfig[state])
		})
	}

	const markSlides = () => {
		const slides = Array.from(sliderWrapper.children)

		const classesConfig = {
			base: ['slide-prev', 'slide-active', 'slide-next'],
		}

		const removeClasses = (slide, classes) => {
			classes.map((name) => slide.classList.remove(name))
		}

		slides.map((slide) => removeClasses(slide, classesConfig.base))

		slides[slideIndex].classList.add('slide-prev')
		slides[slideIndex + 1].classList.add('slide-active')
		slides[slideIndex + 2].classList.add('slide-next')

		transformSlides(slides)
	}

	const moveSlides = () => {
		markSlides()

		const slideWidth = sliderWrapper.querySelector('.slide').offsetWidth
		sliderWrapper.style.transform = `translate3d(-${
			slideIndex * slideWidth
		}px, 0, 0)`
	}

	const cloneSlidesOnClick = (direction) => {
		const slidesAction = Array.from(sliderWrapper.children)
		const firstSlide = slidesAction[0]
		const lastSlide = slidesAction[slidesAction.length - 1]

		const slideWidth = sliderWrapper.querySelector('.slide').offsetWidth

		const clone = (i) => {
			return slides[i % slides.length].cloneNode(true)
		}

		const wrapperTransform = (i) => {
			return (sliderWrapper.style.transform = `translate3d(-${
				i * slideWidth
			}px, 0, 0)`)
		}

		if (direction === 'right') {
			if (cloneIndex - 1 === slides.length) cloneIndex = 1

			sliderWrapper.removeChild(firstSlide)
			sliderWrapper.appendChild(clone(cloneIndex - 1))

			wrapperTransform(slideIndex - 1)
			cloneIndex += 1
			slideIndex -= 1
		} else if (direction === 'left') {
			if (cloneIndex - 1 === -1) cloneIndex = slides.length

			sliderWrapper.removeChild(lastSlide)
			sliderWrapper.insertBefore(clone(cloneIndex - 1), firstSlide)

			wrapperTransform(slideIndex + 1)

			cloneIndex -= 1
			slideIndex += 1
		}
	}

	const moveHandler = (direction) => {
		if (isMoving) return

		isMoving = true
		sliderWrapper.style.transition = 'none'

		cloneSlidesOnClick(direction)

		setTimeout(() => {
			sliderWrapper.style.transition = `transform ${duration}ms ease-in-out`
			direction === 'left' ? (slideIndex -= 1) : (slideIndex += 1)
			moveSlides()
		}, 0)
	}

	sliderWrapper.addEventListener('transitionend', () => {
		isMoving = false
	})

	const mouseEvents = () => {
		arrowLeft.addEventListener('click', () => moveHandler('left'))
		arrowRight.addEventListener('click', () => moveHandler('right'))
	}

	const initSlider = () => {
		cloneSlides()
		setSlidesBase()
		moveSlides()

		mouseEvents()
	}

	initSlider()
}

window.addEventListener('load', () => {
	customSlider('custom_slider', {
		duration: 500,
		slidesInView: 3,
		// effect: {
		// 	depth: 150,
		// 	rotate: 45,
		// },
		navigation: {
			left: 'arrow_left',
			right: 'arrow_right',
		},
	})
})
