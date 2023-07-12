import React from 'react'
import Image from 'next/image'

function Sunshine() {
  return (
    <div id='sunshine' className='bg blue d-flex justify-content-center'>
      <Image
        width={651}
        height={291}
        className='img-fluid'
        src='/images/sunshine.svg'
        alt=''
      />
    </div>
  )
}

export default React.memo(Sunshine)