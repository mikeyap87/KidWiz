import React from 'react'
import Image from 'next/image'
import Link from 'next/link'


function Footer() {
    return (
        <footer id='footer' className='py-lg-5 3 px-lg-0 px-3 pt-lg-0 pt-3 mt-lg-0 mt-3'>
            <div className='container py-lg-5 py-3 my-3'>
                <div className='row'>
                    <div className='col-lg-4 col-6 py-lg-0 py-3'>
                        <h4>KidWiz</h4>
                        <p className='my-1'>
                            <Link className='text-dark text-decoration-none' href="/privacy-policy">
                                Privacy Policy
                            </Link>
                        </p>
                        <p className='my-1'>
                            <Link className='text-dark text-decoration-none' href="/terms-and-conditions">
                                Terms and Conditions
                            </Link>
                        </p>
                    </div>
                    <div className='col-lg-4 col-6 py-lg-0 py-3'>
                        <h4>Resource</h4>
                        <p className='my-1'>
                            <Link className='text-dark text-decoration-none' target='_blank' href="https://kidwizlearning.com/">
                                Educational Blog
                            </Link>
                        </p>
                    </div>
                    <div className='col-lg-4 col-12 py-lg-0 py-3'>
                        <div className='d-flex flex-column justify-content-center align-items-center'>
                            <h4>Resource</h4>
                            <p className='my-1'>
                                1-(530) 325-0852
                            </p>
                            <p className='my-1'>
                                info@kidwizlearning.com
                            </p>
                            <div className='my-2'>
                                <Link className='text-dark text-decoration-none' target='_blank' href="https://www.facebook.com/KidWizLearning">
                                    <Image
                                        height={30}
                                        width={30}
                                        className='img-fluid mx-1'
                                        src='/icons/facebook.svg'
                                        alt=''
                                    />
                                </Link>
                                <Link className='text-dark text-decoration-none' target='_blank' href="https://www.instagram.com/kidwizlearning/">
                                    <Image
                                        height={30}
                                        width={30}
                                        className='img-fluid mx-1'
                                        src='/icons/instagram.svg'
                                        alt=''
                                    />
                                </Link>
                                <Link className='text-dark text-decoration-none' target='_blank' href="https://twitter.com/KidWizLearning/">
                                    <Image
                                        height={30}
                                        width={30}
                                        className='img-fluid mx-1'
                                        src='/icons/twitter.svg'
                                        alt=''
                                    />
                                </Link>
                                <Link className='text-dark text-decoration-none' target='_blank' href="https://twitter.com/KidWizLearning/">
                                    <Image
                                        height={30}
                                        width={30}
                                        className='img-fluid mx-1'
                                        src='/icons/linkedin.svg'
                                        alt=''
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default React.memo(Footer)