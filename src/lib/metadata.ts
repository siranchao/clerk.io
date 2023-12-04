import type { Metadata } from 'next'

export function constructMetadata({
    title = "clerk.io - AI powered document chatbot",
    description = "clerk.io is an open-source software to use AI and LLM to process and analyze PDF files. It allows you to chat with AI based on your document contexts.",
    image = "/thumbnail.png",
    icons = "/favicon.ico",
    noIndex = false
  }: {
    title?: string
    description?: string
    image?: string
    icons?: string
    noIndex?: boolean
  } = {}): Metadata {
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: image
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
        creator: "@ChaoSiran"
      },
      icons,
      metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
      themeColor: '#FFF',
      ...(noIndex && {
        robots: {
          index: false,
          follow: false
        }
      })
    }
  }