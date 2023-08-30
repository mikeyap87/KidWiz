import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
        <Head>
          {/* Updated chatbot script */}
          <script id="__webwhizSdk__" chatbotId="64e9113c36efb9b9f5c7c282"
src="https://widget.webwhiz.ai/webwhiz-sdk.js">
</script>
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
