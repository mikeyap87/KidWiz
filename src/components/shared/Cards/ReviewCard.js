import React from 'react'
import { Rate } from 'antd'

function ReviewCard({ data }) {
    return (
        <div id='review-card' className='p-3 py-lg-5 py-4 bg-white shadow d-flex justify-content-center align-items-center'>
            <div className='d-flex flex-column justify-content-evenly'>
                <div className='d-lg-flex  align-items-center'>
                    <h3 className='fw-bold m-0'>{data.title}</h3>
                    <span className='mx-3 my-0 sm-hidden'>-</span>
                    <p className='m-0 px-0 paragraph my-lg-0 my-3 sm-hidden'>{data.name}</p>
                    <p className='m-0 px-0 paragraph my-lg-0 my-2 sm-visible'>- {data.name}</p>
                </div>
                <p className='m-0 paragraph my-xl-4 my-lg-0'>
                    {data.desc}
                </p>
                <div className='rating-bottom mt-lg-0 mt-2'>
                    <Rate allowHalf disabled defaultValue={5} />
                </div>
            </div>
        </div>
    )
}

export default React.memo(ReviewCard)