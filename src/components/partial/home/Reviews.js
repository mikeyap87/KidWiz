import React from 'react'
import ReviewCard from '~/components/shared/Cards/ReviewCard'
import Slider from 'react-slick'
import Image from 'next/image';
import useSlick from '~/hooks/useSlick';
import { reviews } from '~/config/content';

const settings = {
    dots: false,
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: false,
    nextArrow: false
};

const slides = [0, 1, 2, 3, 4]

function CarousalSection() {

    const { setSlider, onSwipe, handleSlideChange, activeSlide } = useSlick(slides);

    return (
        <section id='carousal-section' className='py-lg-5 py-3'>
            <div className='container py-lg-4 py-2'>
                <div className='row'>
                    <div className='col-lg-6 col-12'>
                        <div className='h-100 d-flex flex-column justify-content-center'>
                            <h2 className='sm-hidden fw-bold side-heading my-3'>
                                Don't take our word for It: Uncover the Life-Changing Impact of KidWiz on Families
                            </h2>
                            <h2 className='sm-visible fw-bold heading my-3 px-5'>
                                Don't take our word for It: Uncover the Life-Changing Impact of KidWiz on Families
                            </h2>
                            <div className='carousal-buttons'>
                                <button name='prev' onClick={handleSlideChange} className='fw-bold btn rounded-circle mx-1'>
                                    <Image
                                        height={21}
                                        width={12}
                                        name='prev'
                                        src='/images/backward-icon.svg'
                                        alt=''
                                    />
                                </button>
                                <button name='next' onClick={handleSlideChange} className='fw-bold btn rounded-circle mx-1'>
                                    <Image
                                        height={21}
                                        width={12}
                                        name='next'
                                        src='/images/forward-icon.svg'
                                        alt=''
                                    />
                                </button>
                            </div>
                            <div className='d-flex carousal-dots mt-3'>
                                {reviews.map((item, index) => (
                                    <span className={`fw-bold ${activeSlide === index && 'active'}`}></span>
                                ))}
                            </div>
                            <div className='flower my-4'>
                                <Image
                                    height={104}
                                    width={82}
                                    src='/images/blue-flower.svg'
                                    alt=''
                                />
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <Slider
                            ref={((slider) => setSlider(slider))}
                            onSwipe={onSwipe}
                            {...settings}
                        >
                            {
                                reviews.map((item) => (
                                    <div className='p-lg-4 p-1 py-4'>
                                        <ReviewCard data={item} />
                                    </div>
                                ))
                            }
                        </Slider>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default React.memo(CarousalSection)