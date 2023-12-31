import Head from 'next/head'
import Layout from '~/components/shared/Layout';
import Banner from '~/components/partial/home/Banner';
import Welcome from '~/components/partial/home/Welcome';
import WhatWeOffer from '~/components/partial/home/WhatWeOffer';
import Sunshine from '~/components/partial/home/Sunshine';
import TopicsWeCover from '~/components/partial/home/TopicsWeCover';
import Reviews from '~/components/partial/home/Reviews';
import FAQ from '~/components/partial/home/FAQ';
import OurVision from '~/components/partial/home/OurVision';
import FlowerAndButterFly from '~/components/partial/home/FlowerAndButterFly';
import JoinUs from '~/components/partial/home/JoinUs';
import HowItWorks from '~/components/partial/home/HowItWorks';
import PreLaunch from '~/components/partial/home/Prelaunch';


export default function Home() {
  return (
    <>
      <Head>
        <title>KidWiz</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Layout>
        <div id='home'>
          <Banner />
          <Welcome />
          <WhatWeOffer />
          <Sunshine />
          <TopicsWeCover />
          <HowItWorks />
          <Reviews />
          <PreLaunch />
          <FAQ />
          <OurVision />
          <FlowerAndButterFly />
          <JoinUs />
        </div>
      </Layout>
    </>
  )
}
