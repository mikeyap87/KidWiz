import React from 'react'
import Image from 'next/image'

function HaveASchool() {
    return (
        <section id='have_a_school'>
            <div className='container mt-3'>
                <div className='d-flex flex-column align-items-center'>
                    <div className='my-3 d-flex align-items-center justify-content-'>
                        <Image
                            width={196}
                            height={170}
                            className='img-fluid sm-hidden'
                            src='/images/pricing-1.svg'
                            alt=''
                        />
                        <div className='mx-3'>
                            <h1 className='fw-bold heading text-center mt-4 mx-lg-0 mx-2'>
                                Have a School?
                            </h1>
                            <h2 className='sub-heading text-center my-1 mt-3 sm-hidden'>
                                Learning for Students 🧠
                            </h2>
                            <h2 className='sub-heading text-center my-1 mt-3 sm-visible'>
                                Learning for K-12 🧠
                            </h2>
                        </div>
                        <Image
                            height={184}
                            width={184}
                            className='img-fluid sm-hidden'
                            src='/images/pricing-2.svg'
                            alt=''
                        />
                    </div>
                    <Image
                        width={196}
                        height={170}
                        className='img-fluid sm-visible'
                        src='/images/pricing-1.svg'
                        alt=''
                    />
                </div>
                <div className='mb-3 pb-3'>
                    <p className='my-4 paragraph'>
                        At KidWiz, we're committed to making personalized learning accessible to all students. Our pricing is based on the number of students using our platform, with discounts available for schools and districts.
                    </p>
                    <p className='my-4 paragraph'>
                        For schools with greater than 100 students, KidWiz costs approximately $5-7 per student per month. We offer custom pricing for larger institutions and districts, so please contact us for more information.
                    </p>
                    <p className='my-4 paragraph'>
                        We also offer special pricing for teachers who want to use KidWiz in their classrooms. Please contact us to learn more about how KidWiz can help enhance your students' learning experience.
                    </p>
                </div>
                <div className='mt-4 mb-5'>
                    <h2 className='side-heading text-center'>
                        Sign up today!
                    </h2>
                    <p className='paragraph text-center mt-4 pt-1'>
                        Give the children at your school the best start in life with our innovative learning solution.
                    </p>
                    <button className="mt-4 mb-5 botton-btn btn bg green text-white w-100">
                        CONTACT US FOR A CUSTOMIZED SCHOOL SOLUTION
                    </button>
                    <div className='d-flex justify-content-center'>
                        <Image
                            height={184}
                            width={184}
                            className='img-fluid sm-visible'
                            src='/images/pricing-2.svg'
                            alt=''
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default React.memo(HaveASchool)