import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Scrollspy from "react-scrollspy";
import Content from "./Content";


function Swipper({ slides, orientation, id }) {

    const imgListRef = useRef();
    const [activeContentIndex, setActiveContentIndex] = useState(0);

    useEffect(() => {
        if (imgListRef.current) {
            window.addEventListener("scroll", getActiveImageIndex);
        }
    }, [imgListRef.current]);

    const getActiveImageIndex = () => {
        const activeEl = imgListRef.current?.querySelector(".offer-img");
        if (activeEl) {
            if (activeEl.getAttribute("id"))
                if (activeEl.getAttribute("id") !== activeContentIndex) {
                    setActiveContentIndex(Number(activeEl.getAttribute("id")));
                }
        }
    };

    return (
        <div id="swipper" className='row my-5'>
            {
                orientation == 'left-to-right' &&
                <div className='col-lg-6 col-12'>
                    {
                        slides?.map((data, index) =>
                            <Content key={index} {...{ data, id, index, activeContentIndex }} />
                        )
                    }
                </div>
            }
            <div className='col-lg-6 col-12'>
                <div id="swipper-image" ref={imgListRef} className='d-flex align-items-center justify-content-center w-100 offer-images'>
                    <Scrollspy
                        items={slides.map((d, i) => `${id}-${i}`)}
                        offset={-400}
                        currentClassName="img-fluid offer-img"
                    >
                        {slides.map((item, i) => (
                            <img
                                id={i}
                                key={i}
                                src={item.img}
                            />
                        ))}
                    </Scrollspy>
                </div>
            </div>
            {
                orientation != 'left-to-right' &&
                <div className='col-lg-6 col-12'>
                    {
                        slides?.map((data, index) =>
                            <Content key={index} {...{ data, id, index, activeContentIndex }} />
                        )
                    }
                </div>
            }
        </div>
    )
}

export default React.memo(Swipper)