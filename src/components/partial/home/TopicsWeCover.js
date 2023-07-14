import React from 'react'
import CollapsableButton from '~/components/shared/Buttons/CollapsableButton'

function WhatWeCover() {
  return (
    <section id="what-we-cover" className='pt-5'>
      <h1 className='text-center fw-bold mt-5 pt-5'>Topics We Cover</h1>
      <p className='text-center sub-heading'>Unlock Your Child's Potential with Our Wide Range of Engaging Topics</p>
      <div className='content my-5 px-2'>
        <div className='d-flex flex-wrap justify-content-center'>
          <CollapsableButton
            title='Social Studies'
            color='orange'
            content='Explore the world and learn about different cultures, societies, and historical events that shape our world.'
          />
          <CollapsableButton
            title='Life Skills'
            color='shocking_pink'
            content="Prepare your child for the real world with lessons on practical life skills, such as time management, financial literacy, and decision-making."
          />
          <CollapsableButton
            title='Biology'
            color='green'
            content='Delve deeper into the mysteries of life with lessons on human anatomy, genetics, and more.'
          />
        </div>
        <div className='d-flex flex-wrap mt-lg-4 justify-content-center'>
          <CollapsableButton
            title='Math'
            color='dull_pink'
            content="Help your child build a strong foundation in mathematics through fun and interactive lessons that cater to their learning style."
          />
          <CollapsableButton
            title='English'
            color='blue'
            content="Foster a love of language and literature with lessons on reading, writing, and grammar that help your child express themselves with confidence."
          />
          <CollapsableButton
            title='Critical Thinking'
            color='shocking_pink'
            content="Develop your child's analytical and problem-solving skills through lessons that encourage them to think critically and make informed decisions."
          />
          <CollapsableButton
            title='Music'
            color='dull_pink'
            content="Develop your child's creativity and appreciation for the arts with lessons on music theory, history, and performance."
          />
        </div>
        <div className='d-flex flex-wrap mt-lg-4 justify-content-center'>
          <CollapsableButton
            title='Enviroment'
            color='green'
            content='Foster a love of nature and a sense of responsibility for our planet with lessons on environmental issues and conservation.'
          />
          <CollapsableButton
            title='Languages'
            color='orange'
            content='Help your child become a global citizen by learning a new language and understanding different cultures and ways of thinking.'
          />
          <CollapsableButton
            title='Coding'
            color='blue'
            content='Equip your child with the skills and knowledge they need to succeed in the digital age with lessons on coding and computer science.'
          />
        </div>
        <div className='d-flex flex-wrap mt-lg-4 justify-content-center'>
          <CollapsableButton
            title='Science'
            color='green'
            content=' Introduce your child to the wonders of the natural world through hands-on experiments and engaging content that sparks their curiosity.'
          />
          <CollapsableButton
            title='Emotions'
            color='shocking_pink'
            content='Help your child understand and manage their emotions and relationships with lessons on emotional intelligence and empathy.'
          />
          <CollapsableButton
            title='Money'
            color='dull_pink'
            content='Teach your child the value of money and how to make smart financial decisions that will benefit them for a lifetime.'
          />
          <CollapsableButton
            title='Entrepreneurship'
            color='shocking_pink'
            content='Encourage your child to think outside the box and become a problem-solver with lessons on entrepreneurship and innovation.'
          />
        </div>
      </div>
    </section>
  )
}

export default React.memo(WhatWeCover)