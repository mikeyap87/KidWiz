import React from 'react'
import { Form, Input } from 'antd';
import Image from 'next/image'

function JoinUs() {

    async function handleSubmit(values) {
        const data = {
            token: 'Ui46UJ',
            event: 'Contact Form',
            customer_properties: {
                $email: 'michael.yap.87@gmail.com'
            },
            properties: {
                values
            }
        };

        // Send data to Klaviyo API using Axios GET request with base64-encoded JSON data as query parameter
        fetch(`https://a.klaviyo.com/api/track?data=${Buffer.from(
            JSON.stringify(data)
        ).toString('base64')}`)
    }

    return (
        <section id='join_us' className='py-lg-5 py-3'>
            <div className='container py-lg-3 pt-lg-5 py-1'>
                <div className='d-flex flex-column align-items-center'>
                    <div className='my-3 d-flex align-items-center'>
                        <Image
                            width={196}
                            height={170}
                            className='sm-hidden'
                            src='/images/join-us-1.svg'
                            alt=''
                        />
                        <h1 className='fw-bold heading text-center mt-4 mx-lg-0 mx-5'>
                            Join us in igniting the Flames of Knowledge!
                        </h1>
                        <Image
                            height={184}
                            width={184}
                            className='sm-hidden'
                            src='/images/join-us-2.svg'
                            alt=''
                        />
                    </div>
                    <div className='row'>
                        <div className='col-4'>
                            <Image
                                height={196}
                                width={170}
                                className='sm-visible img-fluid'
                                src='/images/join-us-1.svg'
                                alt=''
                            />
                        </div>
                        <div className='col-4'>
                            <Image
                                height={184}
                                width={184}
                                className='sm-visible img-fluid'
                                src='/images/join-us-2.svg'
                                alt=''
                            />
                        </div>
                        <div className='col-4'>
                            <Image
                                height={102}
                                width={102}
                                className='sm-visible img-fluid'
                                src='/images/join-us-3.svg'
                                alt=''
                            />
                        </div>
                    </div>
                    <p className='paragraph my-4'>
                        Together, let us ignite the flames of knowledge, and watch as the sparks of wisdom and creativity take flight. We invite you to join us in our quest to create a world where the next generation of innovators, dreamers, and leaders is nurtured and inspired – a world where the pursuit of knowledge knows no bounds.
                    </p>
                </div>
                <Form onFinish={handleSubmit}>
                    <div className='content d-flex flex-column align-items-center my-3'>
                        <Image
                            width={1028}
                            height={420}
                            className='img-fluid sm-hidden'
                            src='/images/join-us-main.svg'
                            alt=''
                        />
                        <Image
                            height={302}
                            width={380}
                            className='img-fluid sm-visible w-80 my-3 mb-5'
                            src='/images/join-us-main-sm.svg'
                            alt=''
                        />
                        <Form.Item
                            rules={[{
                                required: true,
                                type: 'email'
                            }]}
                            className='d-flex justify-content-center w-100'
                            name={'email'}
                        >
                            <Input className='py-3 bottom px-3 w-100' placeholder='Email...' />
                        </Form.Item>
                    </div>
                    <div className='footer d-flex justify-content-center my-lg-5 my-2 px-lg-5 px-1'>
                        <button className="bottom botton-btn btn bg green text-white px-3 fw-bold position-relative" type="submit">
                            <div className="sm-hidden robot position-absolute translate-middle">
                                <Image
                                    height={168}
                                    width={168}
                                    className='ml-5'
                                    src='/images/light-bulb.svg'
                                    alt=''
                                />
                            </div>
                            <div className="sm-visible position-absolute top-100 start-0 translate-middle">
                                <Image
                                    height={80}
                                    width={80}
                                    className='ml-5'
                                    src='/images/light-bulb.svg'
                                    alt=''
                                />
                            </div>
                            SIGN UP FOR FREE TODAY!
                        </button>
                    </div>
                </Form>
            </div>
        </section>
    )
}

export default React.memo(JoinUs)