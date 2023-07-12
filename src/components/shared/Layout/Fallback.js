import React from 'react'
import Image from 'next/image'

function Fallback() {
  return (
    <div className='fallback d-flex justify-content-center align-items-center'>
      <Image
        width={221}
        height={83}
        className='loader img-fluid'
        src='/images/logo.svg'
      />
    </div>
  )
}

export default Fallback