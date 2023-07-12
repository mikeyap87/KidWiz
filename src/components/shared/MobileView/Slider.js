import React from 'react'
import SlickSlider from 'react-slick';
import useSlick from '~/hooks/useSlick';
import Image from 'next/image';

function Slider({ slides }) {

    const { setSlider, onSwipe, handleSlideChange, activeSlide } = useSlick(slides);

    return (
        <div className='row'>
            <div className='col-12'>
                <div className='carousal-buttons my-2'>
                    <button name='prev' onClick={handleSlideChange} className='fw-bold rounded-circle mx-1'>
                        <Image
                            height={21}
                            width={12}
                            name='prev'
                            src='/images/backward-icon.svg'
                            alt=''
                        />
                    </button>
                    <button name='next' onClick={handleSlideChange} className='fw- rounded-circle mx-1'>
                        <Image
                            height={21}
                            width={12}
                            name='next'
                            src='/images/forward-icon.svg'
                            alt=''
                        />
                    </button>
                </div>
                <div className='d-flex carousal-dots justify-content-center mt-3'>
                    {slides.map((item, index) => (
                        <span className={`fw-bold ${activeSlide === index && 'active'}`}></span>
                    ))}
                </div>
            </div>
            <div className='col-12'>
                <SlickSlider onSwipe={onSwipe} ref={((slider) => setSlider(slider))}>
                    {
                        slides.map(item => (
                            <div className='d-flex flex-column'>
                                <div className='w-100'>
                                    <div className="content px-lg-3 px-2 pb-3 d-flex flex-column justify-content-center">
                                        <h2 className='text-center fw-bold side-heading my-4'>
                                            {item.title}
                                        </h2>
                                        <p className='text-start mt-0 mb-2 paragraph'>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                                <div className='w-100'>
                                    <div className='mt-4 mb-5 d-flex align-items-center justify-content-center sticky-top'>
                                        <img
                                            className='img-fluid'
                                            src={item.img} />
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </SlickSlider>
            </div>
        </div>
    )
}

export default React.memo(Slider);