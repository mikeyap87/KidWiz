import React from 'react';
import { Collapse } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { faqs } from "~/config/content";

function FAQ() {
    return (
        <section id='faq' className='bg blue py-5'>
            <div className='container'>
                <div className='py-3'>
                    <h1 className='text-center text-white fw-bold'>Frequently Asked Questions</h1>
                </div>
                <div className='collapse-content py-5 px-lg-0 px-4'>
                    <Collapse
                        accordion
                        size="large"
                        expandIcon={({ isActive }) =>
                            <UpOutlined style={{ color: isActive ? '#000' : '#fff', fontSize: 30 }} rotate={isActive ? 180 : 0} />
                        }
                        items={faqs}
                    />
                </div>
            </div>
        </section>
    )
}

export default React.memo(FAQ)