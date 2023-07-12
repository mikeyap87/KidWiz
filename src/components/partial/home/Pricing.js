import React, { useState } from 'react'
import Image from 'next/image'

function Pricing() {

    const [active, setActive] = useState('monthly')

    function onTabClick(e) {
        setActive(e.target.name)
    }

    return (
        <section id='pricing'>
            <div className='container mt-lg-5 pt-lg-5'>
                <div>
                    <h1 className='fw-bold heading text-center mx-lg-0 mx-5 px-lg-2 px-4'>
                        Try KidWiz for FREE!
                    </h1>
                    <p className='sub-heading text-center mx-lg-0 mx-5 px-lg-0  px-5'>
                        Unleash Learning: <span className='bold'>7-Day FREE Trial</span> of KidWiz! 🧠
                    </p>
                    <div className='tabs d-flex justify-content-center mt-4 mb-lg-5 mb-3 pb-lg-4'>
                        <div className='d-flex body'>
                            <div className='switch d-flex'>
                                <a
                                    name='monthly'
                                    onClick={onTabClick}
                                    className={`mx-1 ${active === 'monthly' ? 'active' : ''}`}
                                >
                                    Monthly
                                </a>
                                <a
                                    name='yearly'
                                    onClick={onTabClick}
                                    className={`mx-1 ${active === 'yearly' ? 'active' : ''}`}
                                >
                                    Yearly
                                </a>
                            </div>
                            <div className='save-upto my-3'>
                                <Image
                                    className='sm-hidden'
                                    src="/images/save-upto.svg"
                                    width={150}
                                    height={49}
                                />
                                <Image
                                    className='sm-visible'
                                    src="/images/save-upto-2.svg"
                                    width={150}
                                    height={49}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='content'>
                    <div className='row'>
                        <div className='col-lg-4 col-12 px-lg-2 px-4'>
                            <div className='package-card my-3 py-5 orange'>
                                <h2 className='text-center'>Basic Plan</h2>
                                <h2 className='text-center mb-4'>${active === 'monthly'? '79' : '63'}<span className='child-span'>/mo.</span></h2>
                                <p className='my-3 mb-4'>This tier includes access to:</p>
                                <div className='mt-4 pt-2 features'>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Access to our AI-Powered Personalized Learning Companion</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Daily personalized lesson plans and activities</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Basic progress tracking</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Math, Science, Biology, English, Social Studies</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>1 Child’s Profile</span>
                                    </div>
                                </div>
                                <div className='mb-1 mt-5 pt-2'>
                                    <button className='botton-btn btn bg green text-white w-100'>
                                        Start 7-day Free Trial!
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-12 mt-2 px-lg-2 px-4'>
                            <div className='package-card mt-lg-2 mt-5 my-3 py-5 green position-relative'>
                                <div className='best-value position-absolute d-flex justify-content-center align-items-center px-lg-5 px-4 py-2'>
                                    <Image src='/icons/star.svg' height={32} width={45} alt='' />
                                    <span className='mx-2 mb-1'>BEST VALUE</span>
                                </div>
                                <div className='butter-fly position-absolute'>
                                    <Image src='/images/butterfly.svg' height={175} width={175} alt='' />
                                </div>
                                <h2 className='text-center'>PRO PLAN</h2>
                                <h2 className='text-center mb-4'>${active === 'monthly'? '109' : '87'}<span className='child-span'>/mo.</span></h2>
                                <p className='my-3 mb-4'>Everything in the Basic Plan, plus:</p>
                                <div className='mt-4 pt-2 features'>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Comprehensive progress tracking</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>In-app parent support and resources</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Big 5 Personality Test with Specific Niche Parental Training</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Music, Languages, Coding, Life Skills, Money</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>2 Children’s Profiles</span>
                                    </div>
                                </div>
                                <div className='mb-1 mt-5 pt-2'>
                                    <button className='botton-btn btn bg green text-white w-100'>
                                        Start 7-day Free Trial!
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-12 px-lg-2 px-4'>
                            <div className='package-card my-3 py-5 purple'>
                                <h2 className='text-center'>PREMIUM PLAN</h2>
                                <h2 className='text-center mb-4'>${active === 'monthly'? '249' : '199'}<span className='child-span'>/mo.</span></h2>
                                <p className='my-3 mb-4'>This tier includes access to:</p>
                                <div className='mt-4 pt-2 features'>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Monthly one-on-one virtual sessions with a certified early childhood educator</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Priority access to new features and content</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Basic progress tracking</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>Emotional Intelligence, Critical Thinking, Environmental Studies, Entrepreneurship</span>
                                    </div>
                                    <div className='d-flex align-items-start my-2'>
                                        <div className='w-10'>
                                            <Image src='/images/tick.svg' alt='' height={15} width={15} />
                                        </div>
                                        <span className='w-90'>3 Children’s Profiles</span>
                                    </div>
                                </div>
                                <div className='mb-1 mt-5 pt-2'>
                                    <button className='botton-btn btn bg green text-white w-100'>
                                        Start 7-day Free Trial!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default React.memo(Pricing)