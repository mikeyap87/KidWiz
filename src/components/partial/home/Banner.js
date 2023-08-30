import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import VideoPlayer from '~/components/shared/VideoPlayer'

function Banner() {

    return (
        <section id='banner' >
            <div className='curve bg blue' alt='' />
            <div className='container h-100 py-5'>
                <div className='row h-100'>
                    <div className='h-100 col-lg-6 col-12 d-flex flex-column justify-content-center'>
                        <div className='my-lg-5 my-0 mx-lg-0 mx-4'>
                            <h1 className='fw-bold heading'>
                                Unlock Your 
                                <span className='text green'>
                                    {" Child's Full Potential"}
                                </span>
                            </h1>
                            <h5 className='sub-heading'>
                                Nurture your child’s growth with our <span className='bold'>AI-Powered</span> Personalized Learning Companion.
                            </h5>
                        </div>
                        <div className='d-flex justify-content-center w-75'>
                            <div className='d-flex flex-column sm-hidden'>
                                <div className='bubble-button position-relative my-3 bot align-self-start one'>
                                    <Image
                                        height={55}
                                        width={55}
                                        className='position-absolute top-0 start-0 translate-middle'
                                        src='/images/chatbot-avatar.svg'
                                        alt=''
                                    />
                                    <span className='m-0'>
                                        Hi there, Sarah! Are you ready for a fun day of learning?
                                    </span>
                                </div>
                                <div className='bubble-button position-relative my-3 user align-self-end two'>
                                    <Image
                                        height={55}
                                        width={55}
                                        className='position-absolute top-0 start-100 translate-middle'
                                        src='/images/git-avatar.svg'
                                        alt=''
                                    />
                                    <span className='m-0'>
                                        Yes, I'm excited!
                                    </span>
                                </div>
                                <div className='bubble-button position-relative my-3 bot align-self-start three'>
                                    <Image
                                        height={55}
                                        width={55}
                                        className='position-absolute top-0 start-0 translate-middle'
                                        src='/images/chatbot-avatar.svg'
                                        alt=''
                                    />
                                    <span className='m-0'>
                                        That's great! Today, we'll explore the world of animals. What's your
                                        favorite animal?
                                    </span>
                                </div>
                                <div className='bubble-button position-relative my-3 user align-self-end four'>
                                    <Image
                                        height={55}
                                        width={55}
                                        className='position-absolute top-0 start-100 translate-middle'
                                        src='/images/git-avatar.svg'
                                        alt=''
                                    />
                                    <span className='m-0'>
                                        I love elephants!
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link href='#prelaunch' className="botton-btn px-3 py-2 mx-3 btn bg green text-white fw-bold sm-visible">
                            GET STARTED FOR FREE
                        </Link>
                    </div>
                    <div className='col-lg-6 col-12'>
                        <div className='h-100 d-flex flex-column align-items-center'>
                            <VideoPlayer src={'/video/KidWiz.mp4'} thumbnail={'/images/bot-image.svg'} />
                            <Link href='#prelaunch' className="botton-btn px-lg-5 py-2 btn bg green text-white fw-bold sm-hidden">
                                GET STARTED FOR FREE
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default React.memo(Banner)
