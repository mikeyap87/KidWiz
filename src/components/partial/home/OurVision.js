import React from 'react'
import Image from 'next/image'

function OurVision() {
    return (
        <section id='our_vision' className='pb-5'>
            <div className='container py-lg-3 py-1'>
                <div className='heading my-3'>
                    <h1 className='fw-bold heading'>
                        Our Vision
                    </h1>
                    <p className='sub-heading'>
                        Igniting the Flames of Knowledge within each Child and Parent!
                    </p>
                </div>
                <div className='row my-5'>
                    <div className='col-lg-6 col-12'>
                        <div className='h-100 d-flex flex-column justify-content-center'>
                            <h2 className='fw-bold side-heading w-lg-90 w-100 my-3'>
                                Empower Children to Reach Limitless Potential
                            </h2>
                            <p className='paragraph w-lg-75 w-100 mt-3'>
                                At KidWiz, we envision a world where the potential of every child is limitless, and the boundaries of education are shattered. We believe that every child, regardless of their circumstances or background, deserves the opportunity to learn, grow, and prosper. Our mission is to foster the innate curiosity and imagination that lies within every young mind and empower them to soar to new heights.
                            </p>
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='d-flex justify-content-center'>
                            <Image 
                                height={372}
                                width={236}
                                src='/images/our-vision-1.svg'
                                alt=''
                            />
                        </div>
                    </div>
                    <div className='col-12'>
                        <h2 className='fw-bold side-heading w-lg-90 w-100 my-3 mt-5 pt-3 text-center'>
                            Revolutionize Education with AI-Driven Technologies
                        </h2>
                        <p className='w-lg-75 paragraph w-100 mt-3'>
                            We are relentless in our pursuit of revolutionizing the education landscape by harnessing the power of cutting-edge artificial intelligence and machine learning technologies. By crafting personalized learning experiences that cater to each child's unique strengths and weaknesses, we strive to eliminate the barriers that stand in their way.
                        </p>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='d-flex third-img'>
                            <Image
                                height={400}
                                width={292}
                                src='/images/our-vision-2.svg'
                                alt=''
                            />
                        </div>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='h-100 d-flex flex-column justify-content-center'>
                            <h2 className='fw-bold side-heading w-lg-75 w-100 my-3 text-end'>
                                Forge a New Path to a Brighter Future
                            </h2>
                            <p className='w-75 paragraph w-lg-75 w-100 mt-3 mt-3'>
                                As pioneers in AI-driven education, we refuse to settle for mediocrity. We are determined to break free from the confines of traditional learning methodologies and forge a new path. A path that leads to a brighter future, a future where every child has access to the tools and resources they need to thrive in this ever-evolving world.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default React.memo(OurVision)