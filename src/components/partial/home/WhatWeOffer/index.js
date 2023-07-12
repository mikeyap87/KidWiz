import React from 'react'
import MobileView from './Mobile'
import DesktopView from './Desktop'
import useWidth from '~/hooks/useWidth'


function WhatWeOffer() {

    const innerWidth = useWidth();

    if (innerWidth < 768) {
        return (
            <MobileView  />
        )
    }
    else {
        return (
            <DesktopView />
        )
    }
}

export default React.memo(WhatWeOffer)