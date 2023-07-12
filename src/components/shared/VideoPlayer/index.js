import React, { useState } from 'react'
import Image from 'next/image';
import { CloseOutlined } from '@ant-design/icons'

function VideoPlayer({ src, thumbnail }) {

    const [videoActive, setVideoActive] = useState(false);

    function onVideoClick() {
        setVideoActive(!videoActive)
    }

    return (
        <div className={`h-100 w-100`}>
            <Image
                width={489}
                height={620}
                onClick={onVideoClick}
                className='img-fluid video-avatar'
                src={thumbnail}
                alt=''
            />
            <div id='video-player'>
                {
                    videoActive &&
                    <div className='video-player-overlay d-flex justify-content-center align-items-center'>
                        <div className='video-container d-flex flex-column align-items-end'>
                            <div className='close-icon' onClick={onVideoClick}>
                                <CloseOutlined style={{ fontSize: 25 }} />
                            </div>
                            <video autoPlay controls width="100%" height="auto" >
                                <source type="video/mp4" src={src} />
                            </video>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default React.memo(VideoPlayer)