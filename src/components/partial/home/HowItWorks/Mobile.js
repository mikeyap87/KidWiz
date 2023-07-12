import React from 'react'
import Slider from '~/components/shared/MobileView/Slider';

const settings = {
    dots: false,
    infinite: false,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: false,
    nextArrow: false
};

function Mobile({ how_it_works, early_education }) {
    return (
        <section id="how-it-works" >
            <h1 className='text-center fw-bold heading'>How It Works?</h1>
            <p className='text-center sub-heading mb-4 mx-lg-0 mx-5'>7 Steps to Begin Your Child’s Journey</p>
            <Slider settings={settings} slides={how_it_works} />
            <div className='bottom-content'>
                <div className='d-flex justify-content-center'>
                    <h1 className='heading text-center fw-bold mt-2 mb-5 mx-lg-0 mx-5'>Your Child's Early Education is Important</h1>
                </div>
            </div>
            <Slider settings={settings} slides={early_education} />
        </section>
    )
}

export default React.memo(Mobile)