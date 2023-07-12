import React from 'react'

function Welcome() {
  return (
    <section id='welcome' className='py-lg-5 py-2'>
      <div className="content pt-lg-4 pyt-1">
        <div className='container sm-hidden d-flex flex-column align-items-center justify-content-around'>
          <div>
            <h1 className='mt-5 fw-bold'>Welcome to KidWiz!</h1>
            <h4 className='sub-heading mt-2 mb-5'>
              The AI-Powered Personalized Learning Companion that is revolutionizing early childhood education and parenting skills.
            </h4>
            <p className='mt-3 paragraph'>
              Welcome to KidWiz, the AI-powered personalized learning companion that's revolutionizing early childhood education. Our innovative solution combines the best elements from various educational approaches to create a truly unique and engaging learning experience for your child.
            </p>
            <p className='my-3 mb-5 paragraph'>
              With KidWiz, your child will have access to a comprehensive range of topics, including specialized skills like music, languages, coding, and entrepreneurship, as well as life skills and emotional intelligence lessons. Plus, our interactive parental role-playing scenarios allow you to practice and develop your parenting skills in real-world situations. Join the KidWiz community today and give your child the gift of a lifetime of learning.
            </p>
          </div>
        </div>
        <div className='sm-visible pt-4'>
          <div className='container'>
            <h1 className='mt-5 fw-bold mx-5'>Welcome to KidWiz!</h1>
            <h4 className='sub-heading mt-2 mb-5 mx-4'>
              The AI-Powered Personalized Learning Companion that is revolutionizing early childhood education and parenting skills.
            </h4>
            <p className='mt-3 paragraph'>
              Welcome to KidWiz, the AI-powered personalized learning companion that's revolutionizing early childhood education. Our innovative solution combines the best elements from various educational approaches to create a truly unique and engaging learning experience for your child.
            </p>
            <p className='my-3 mb-5 paragraph'>
              With KidWiz, your child will have access to a comprehensive range of topics, including specialized skills like music, languages, coding, and entrepreneurship, as well as life skills and emotional intelligence lessons. Plus, our interactive parental role-playing scenarios allow you to practice and develop your parenting skills in real-world situations. Join the KidWiz community today and give your child the gift of a lifetime of learning.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default React.memo(Welcome)