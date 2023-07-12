import React from 'react'
import Image from 'next/image';
import Link from 'next/link'

function WhatWeOffer() {
    return (
        <section id='what_we_offer'>
            <div className='container py-lg-3 py-1'>
                <div className='heading my-3'>
                    <h1 className='heading fw-bold'>
                        What We Offer
                    </h1>
                    <p className='sub-heading'>
                        Education that Goes Beyond the Traditional Classroom
                    </p>
                </div>
                <div className='row my-5'>
                    <div className='col-lg-6 col-12'>
                        <div className='pb-3 h-100 d-flex flex-column justify-content-center'>
                            <h2 className='fw-bold side-heading my-3'>
                                Sparking Curiosity and Creativity with KidWiz's Interactive Education
                            </h2>
                            <p className='mt-3 paragraph'>
                                At KidWiz, we believe that every child is unique and deserves an education that caters to their individual strengths and interests. That's why we offer a comprehensive range of topics that go beyond the traditional classroom subjects. Our interactive and engaging lessons are designed to spark curiosity, foster creativity, and develop critical thinking skills in children ages 5-12.
                            </p>
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='d-flex justify-content-center'>
                            <Image
                                width={234}
                                height={477}
                                className='img-fluid'
                                src='/images/what-we-offer-1.svg'
                                alt=''
                            />
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='d-flex justify-content-center'>
                            <Image
                                width={489}
                                height={630}
                                className='img-fluid'
                                src='/images/what-we-offer-2.svg'
                                alt=''
                            />
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='mt-5 h-100 d-flex flex-column justify-content-center'>
                            <h2 className='fw-bold side-heading my-3 text-end'>
                                Role-Playing Scenarios for Parents
                            </h2>
                            <p className='mt-3 paragraph mb-5'>
                                In addition to our standard curriculum, we also offer a unique feature that sets us apart from other educational platforms: parental role-playing scenarios. This innovative tool allows parents to practice real-life scenarios with their children, teaching them valuable life skills such as conflict resolution, decision-making, and communication. By practicing these scenarios in a safe and controlled environment, children are better equipped to handle challenging situations they may encounter in the real world.
                            </p>
                            <h2 className='fw-bold side-heading mt-4 text-end'>
                                A Well-Rounded Education for Success
                            </h2>
                        </div>
                    </div>
                    <div className='col-12'>
                        <p className='paragraph mt-4 pt-2'>
                            From building a strong foundation in math to exploring the wonders of the natural world through science, biology, and environmental studies, KidWiz offers a well-rounded education that prepares children for success in all areas of life. Our English lessons help children develop language and literacy skills, while our social studies curriculum explores different cultures and historical events that shape our world.
                        </p>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='my-3 h-100 d-flex flex-column justify-content-center'>
                            <h2 className='fw-bold side-heading my-3'>
                                Beyond the Basics: Specialized Topics at KidWiz
                            </h2>
                            <p className='mt-3 paragraph'>
                                We also offer a range of specialized topics, including music, languages, coding, and entrepreneurship, that equip children with the skills and knowledge they need to succeed in the digital age. Our life skills lessons prepare children for the real world, teaching them practical skills like time management, financial literacy, and decision-making. And our emotional intelligence and critical thinking lessons help children develop analytical and problem-solving skills, as well as empathy and self-awareness.
                            </p>
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='d-flex justify-content-center align-items-center h-100'>
                            <Image
                                width={162}
                                height={366}
                                className='img-fluid'
                                src='/images/what-we-offer-3.svg'
                                alt=''
                            />
                        </div>
                    </div>
                    <div className='col-12'>
                        <h2 className='mt-5 fw-bold side-heading mb-3 text-center'>
                            Practical Life Skills and EQ for the Real-World
                        </h2>
                        <p className='mt-3 paragraph mb-5'>
                            At KidWiz, we believe that education is more than just memorizing facts and figures. It's about unlocking your child's potential and helping them become confident, well-rounded individuals who are prepared to tackle any challenge that comes their way. Join the KidWiz community today and give your child the gift of a lifetime of learning.
                        </p>
                    </div>
                </div>
                <div className='footer d-flex justify-content-center my-5 pt-3'>
                    <Link href='#prelaunch'>
                        <button className="botton-btn px-5 py-3 btn bg green text-white px-3 fw-bold position-relative" type="submit">
                            <div className="robot position-absolute translate-middle">
                                <Image
                                    width={150}
                                    height={150}
                                    className='img-fluid ml-5'
                                    src='/images/relation-bot.svg'
                                    alt=''
                                />
                            </div>
                            GET STARTED FOR FREE
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default React.memo(WhatWeOffer)