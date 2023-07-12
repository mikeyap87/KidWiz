import React from "react";
import Swipper from "./Swipper";

function HowItWorks({ how_it_works, early_education }) {
    return (
        <section id="how-it-works" className='py-5'>
            <div className='container'>
                <div className="sticky-20 mb-5 header">
                    <h1 className='text-center fw-bold mt-5'>How It Works?</h1>
                    <p className='text-center sub-text'>Steps to Begin Your Child’s Journey</p>
                </div>
                <div className="sticky-20">
                    <Swipper slides={how_it_works} id={'content-1'} orientation='left-to-right' />
                </div>
            </div>
            <div className="container">
                <div className="sticky-20 d-flex justify-content-center header">
                    <h1 className='text-center fw-bold px-3 my-3'>Your Child's Early Education is Important</h1>
                </div>
                <div className='d-flex justify-content-center'>
                    <Swipper slides={early_education} id={'content-2'} orientation='right-to-left' />
                </div>
            </div>
        </section>
    )
}

export default React.memo(HowItWorks)