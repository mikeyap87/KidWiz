import React from 'react'

function Content({ id, data, index, activeContentIndex }) {
    return (
        <div
            id={`${id}-${index}`}
            key={index}
            className={`content px-3 pb-3 d-flex flex-column justify-content-center ${activeContentIndex == index ? "" : "opacity-10"}`}
        >
            <h2 className='fw-bold side-heading'>
                {data.title}
            </h2>
            <p className='paragraph mt-2 mb-4'>
                {data.desc}
            </p>
        </div>
    )
}

export default React.memo(Content)