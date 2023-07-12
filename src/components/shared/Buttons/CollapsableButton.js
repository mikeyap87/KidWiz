import React from 'react'

function CollapsableButton({ title, color, content }) {
    return (
        <button className={`btn button-colored ${color} mx-lg-3 mx-4 mt-lg-1 mt-3 py-lg-2 py-3`}>
            {title}
            <span className='py-2 fw-normal w-100 rounded-bottom'>
                {content}
            </span>
        </button>
    )
}

export default React.memo(CollapsableButton)