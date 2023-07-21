import React, { useState } from 'react';
import { Drawer } from 'antd';
import Link from 'next/link';

function Slider({ open, setOpen }) {
    const onClose = () => {
        setOpen(false);
    };
    return (
        <Drawer zIndex={1020} size='small' placement="right" onClose={onClose} open={open}>
            <ul id="slider-menu" className="navbar-nav me-auto mb-2 mb-lg-0 w-100 d-flex justify-content-center">
                <li className="nav-item mx-3">
                    <Link
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/#what-we-cover"
                        onClick={() => setOpen(false)}
                    >
                        Topics
                    </Link>
                </li>
                <li className="nav-item mx-3">
                    <Link
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/#how-it-works"
                        onClick={() => setOpen(false)}
                    >
                        How It Works
                    </Link>
                </li>
                <li className="nav-item mx-3">
                    <Link
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/#what_we_offer"
                        onClick={() => setOpen(false)}
                    >
                        Features
                    </Link>
                </li>
                <li className="nav-item mx-3">
                    <Link
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/#prelaunch"
                        onClick={() => setOpen(false)}
                    >
                        Pricing
                    </Link>
                </li>
                <li className="nav-item mx-3">
                    <Link
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/#faq"
                        onClick={() => setOpen(false)}
                    >
                        FAQ
                    </Link>
                </li>
                <li className="nav-item mx-3">
                    <Link
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/#our_vision"
                        onClick={() => setOpen(false)}
                    >
                        Vision
                    </Link>
                </li>
            </ul>
        </Drawer>
    );
};
export default React.memo(Slider);