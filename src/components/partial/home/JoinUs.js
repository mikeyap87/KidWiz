import React, { useState } from 'react'
import { Form, Input, notification, Button } from 'antd';
import Image from 'next/image'

function JoinUs() {
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    async function handleSubmit(values) {
        setLoading(true)
        const data = {
            type: 'subscription',
            attributes: {
                profile: {
                    data: {
                        type: 'profile',
                        attributes: {
                            meta: { patch_properties: { append: { skus: ['92538', '40571'] } } },
                            email: values.email,
                            first_name: values.full_name
                        },
                        id: '01GDDKASAP8TKDDA2GRZDSVP4H'
                    }
                },
                custom_source: 'Prelaunch Sign up!'
            },
            relationships: { list: { data: { type: 'list', id: 'RzdCPx' } } }
        }
        const options = {
            method: 'POST',
            headers: { revision: '2023-07-15', 'content-type': 'application/json' },
            body: JSON.stringify({ data })
        };
        // Send data to Klaviyo API using Axios GET request with base64-encoded JSON data as query parameter
        fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=Ui46UJ`, options)
            .then(() => {
                setLoading(false)
                api.success({
                    message: 'Success!',
                    description:
                        "You're on board! Thank you for signing up for our pre-release email updates. We can't wait to share exciting news about our product with you. Stay tuned.",
                });
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            {contextHolder}
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
                            <Button loading={loading} className="bottom botton-btn btn bg green text-white px-3 fw-bold position-relative" htmlType="submit">
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
                            </Button>
                        </div>
                    </Form>
                </div>
            </section>
        </>
    )
}

export default React.memo(JoinUs)