import React from "react";
import MobileView from './Mobile'
import DesktopView from './Desktop'
import { how_it_works, early_education } from "~/config/content";
import useWidth from '~/hooks/useWidth'

function HowItWorks() {

    const innerWidth = useWidth();

    if (innerWidth < 768) {
        return (
            <MobileView how_it_works={how_it_works} early_education={early_education} />
        )
    }
    else {
        return (
            <DesktopView how_it_works={how_it_works} early_education={early_education} />
        )
    }
}

export default React.memo(HowItWorks)