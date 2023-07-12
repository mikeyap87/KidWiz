import React from 'react'
import Nav from './Nav'
// import ChatBot from './ChatBot'
import Footer from './Footer'

function LayoutComponent({ children }) {
    return (
        <>
            <Nav />
            {children}
            {/* <ChatBot /> */}
            <Footer />
        </>
    )
}

export default React.memo(LayoutComponent)