import React, { useState } from 'react';
import { Button, Drawer } from 'antd';

function Slider({ open, setOpen }) {
    const onClose = () => {
        setOpen(false);
    };
    return (
        <Drawer zIndex={1020} size='small' placement="right" onClose={onClose} open={open}>
            <ul id="slider-menu" className="navbar-nav me-auto mb-2 mb-lg-0 w-100 d-flex justify-content-center">
                <li className="nav-item mx-3">
                    <a
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="#what-we-cover"
                    >
                        Topics
                    </a>
                </li>
                <li className="nav-item mx-3">
                    <a
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="#how-it-works"
                    >
                        How It Works
                    </a>
                </li>
                <li className="nav-item mx-3">
                    <a
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="#what_we_offer"
                    >
                        Features
                    </a>
                </li>
                <li className="nav-item mx-3">
                    <a
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="/home#pricing"
                    >
                        Pricing
                    </a>
                </li>
                <li className="nav-item mx-3">
                    <a
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="#faq"
                    >
                        FAQ
                    </a>
                </li>
                <li className="nav-item mx-3">
                    <a
                        className="nav-link fw-bold text-dark"
                        aria-current="page"
                        href="#our_vision"
                    >
                        Vision
                    </a>
                </li>
            </ul>
        </Drawer>
    );
};
export default React.memo(Slider);