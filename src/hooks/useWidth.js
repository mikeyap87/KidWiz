import { useEffect, useState } from 'react'

function useWidth() {

    const [innerWidth, setInnerWidth] = useState(0)

    useEffect(() => {
        setInnerWidth(window.innerWidth)
    }, [])

    return innerWidth
}

export default useWidth