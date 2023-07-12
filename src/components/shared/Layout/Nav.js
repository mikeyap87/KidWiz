import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Slider from './Slider'

function Nav() {

    const [open, setOpen] = useState(false)

    return (
        <>
            <nav id='header' className="navbar navbar-expand-lg navbar-white bg-white shadow sticky-top">
                <div className="container">
                    <Link className="navbar-brand" href="/#">
                        <Image
                            width={221}
                            height={83}
                            className='img-fluid'
                            src='/images/logo.png'
                            alt=''
                        />
                    </Link>
                    <button onClick={() => setOpen(!open)} className="navbar-toggler border-0">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse">
                        <ul className="mt-4 pt-3 navbar-nav me-auto mb-2 mb-lg-0 w-100 d-flex justify-content-center">
                            <li className="nav-item mx-3">
                                <Link
                                    className="nav-link fw-bold text-dark"
                                    aria-current="page"
                                    href="/#what-we-cover"
                                >
                                    Topics
                                </Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link
                                    className="nav-link fw-bold text-dark"
                                    aria-current="page"
                                    href="/#how-it-works"
                                >
                                    How it works
                                </Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link
                                    className="nav-link fw-bold text-dark"
                                    aria-current="page"
                                    href="/#what_we_offer"
                                >
                                    Features
                                </Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link
                                    className="nav-link fw-bold text-dark"
                                    aria-current="page"
                                    href="/home#pricing"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link
                                    className="nav-link fw-bold text-dark"
                                    aria-current="page"
                                    href="/#faq"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link
                                    className="nav-link fw-bold text-dark"
                                    aria-current="page"
                                    href="/#our_vision"
                                >
                                    Vision
                                </Link>
                            </li>
                        </ul>
                        <div className="d-flex">
                            <Link href='#prelaunch' className="nav-btn btn bg green text-white px-3 fw-bold">
                                GET STARTED FOR FREE
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <Slider open={open} setOpen={setOpen} />
        </>
    )
}

export default React.memo(Nav)