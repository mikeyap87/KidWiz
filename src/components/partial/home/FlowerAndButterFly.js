import React from 'react'
import Image from 'next/image'

function FlowerAndButterFly() {
    return (
        <div id='flower_and_butterfly' className='bg blue d-flex justify-content-center'>
            <Image
                height={379}
                width={638}
                className='img-fluid'
                src='/images/flower-and-butterfly.svg'
                alt=''
            />
        </div>
    )
}

export default React.memo(FlowerAndButterFly)