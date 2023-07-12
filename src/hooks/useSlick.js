import { useState } from 'react'

function useSlick(slides) {

    const [slider, setSlider] = useState();
    const [activeSlide, setActiveSlide] = useState(0);

    function handleSlideChange(e) {
        if (e.target.name === 'prev') {
            if (activeSlide > 0) {
                slider.slickGoTo(slider.innerSlider.state.currentSlide - 1)
                setActiveSlide(slider.innerSlider.state.currentSlide - 1)
            }
            else {
                slider.slickGoTo(slides.length - 1)
                setActiveSlide(slides.length - 1)
            }
        }
        else {
            if (activeSlide < slides.length - 1) {
                slider.slickGoTo(slider.innerSlider.state.currentSlide + 1)
                setActiveSlide(slider.innerSlider.state.currentSlide + 1)
            }
            else {
                slider.slickGoTo(0)
                setActiveSlide(0)
            }
        }
    }

    function onSwipe(e) {
        if (e === 'left') {
            if (activeSlide < slides.length - 1) {
                setActiveSlide(activeSlide + 1)
            }
            else {
                setActiveSlide(0)
            }
        }
        else {
            if (activeSlide > 0) {
                setActiveSlide(activeSlide - 1)
            }
            else {
                setActiveSlide(slides.length - 1)
            }
        }
    }

    return {
        slider,
        setSlider,
        handleSlideChange,
        onSwipe,
        activeSlide
    }

}

export default useSlick