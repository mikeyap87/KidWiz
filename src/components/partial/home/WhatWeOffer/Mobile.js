import React from 'react'
import Slider from '~/components/shared/MobileView/Slider'
import Link from 'next/link'

const slides = [
    {
        title: "Sparking Curiosity and Creativity with KidWiz's Interactive Education.",
        desc: "At KidWiz, we believe that every child is unique and deserves an education that caters to their individual strengths and interests. That's why we offer a comprehensive range of topics that go beyond the traditional classroom subjects. Our interactive and engaging lessons are designed to spark curiosity, foster creativity, and develop critical thinking skills in children ages 5-12.",
        img: '/images/what-we-offer-1.svg',
    },
    {
        title: "Role-Playing Scenarios for Parents.",
        desc: "In addition to our standard curriculum, we also offer a unique feature that sets us apart from other educational platforms: parental role-playing scenarios. This innovative tool allows parents to practice real-life scenarios with their children, teaching them valuable life skills such as conflict resolution, decision-making, and communication. By practicing these scenarios in a safe and controlled environment, children are better equipped to handle challenging situations they may encounter in the real world.",
        img: '/images/what-we-offer-2.svg',
    },
    {
        title: "Beyond the Basics: Specialized Topics at KidWiz",
        desc: "We also offer a range of specialized topics, including music, languages, coding, and entrepreneurship, that equip children with the skills and knowledge they need to succeed in the digital age. Our life skills lessons prepare children for the real world, teaching them practical skills like time management, financial literacy, and decision-making. And our emotional intelligence and critical thinking lessons help children develop analytical and problem-solving skills, as well as empathy and self-awareness.",
        img: '/images/what-we-offer-3.svg',
    },
]

function WhatWeOffer() {
    return (
        <section id='what_we_offer'>
            <div className='container py-1'>
                <div className='heading my-3'>
                    <h1 className='heading fw-bold mb-4'>
                        What We Offer
                    </h1>
                    <p className='sub-heading'>
                        Education that Goes Beyond the Traditional Classroom
                    </p>
                </div>
                <Slider slides={slides} />
                <div className='footer d-flex justify-content-center my-0 mb-4'>
                    <Link href='#prelaunch' className="botton-btn px-5 py-3 btn bg green text-white fw-bold" type="submit">
                        GET STARTED FOR FREE
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default React.memo(WhatWeOffer)