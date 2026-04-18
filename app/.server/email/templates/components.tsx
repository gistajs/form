import type { ReactNode } from 'react'
import {
  Body,
  Button as EmailButton,
  Container,
  Head,
  Heading as EmailHeading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from 'react-email'

export function Layout({ badge, title, subtitle, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className="m-0 bg-[#f3ede2] px-3 py-6 font-sans text-[#1f2937]">
          <Container className="mx-auto max-w-[560px] overflow-hidden rounded-[28px] border border-solid border-[#eadfcb] bg-[#fffdf8] shadow-[0_20px_60px_rgba(120,53,15,0.12)]">
            <Section className="bg-[radial-gradient(circle_at_top_left,#fbbf24_0%,#f59e0b_30%,#b45309_100%)] px-7 py-7 text-[#fffdf8]">
              <Text className="m-0 inline-block rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold tracking-[0.08em] text-[#fffdf8] uppercase">
                {badge}
              </Text>
              <EmailHeading className="m-0 mt-[18px] text-[32px] leading-[1.1] font-extrabold text-[#fffdf8]">
                {title}
              </EmailHeading>
              <Text className="m-0 mt-[10px] text-[15px] leading-[1.7] text-[#fff8ec]">
                {subtitle}
              </Text>
            </Section>

            <Section className="px-7 py-7">{children}</Section>

            <Hr className="mx-7 my-0 border border-solid border-[#efe4d2]" />
            <Text className="m-0 px-7 py-6 text-center text-[12px] leading-[1.7] text-[#9ca3af]">
              Sent by your app. Update the sender and copy to match your product
              before shipping.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function P({ children }: ChildrenProps) {
  return (
    <Text className="m-0 mb-4 text-[16px] leading-[1.75] text-[#374151]">
      {children}
    </Text>
  )
}

export function Button({ href, children }: ButtonProps) {
  return (
    <Section className="my-7 text-center">
      <EmailButton
        href={href}
        className="rounded-full bg-[#111827] px-6 py-3.5 text-[15px] font-bold text-[#fffdf8] no-underline"
      >
        {children}
      </EmailButton>
    </Section>
  )
}

export function UrlBox({ url }: { url: string }) {
  return (
    <Section className="my-6 rounded-[20px] border border-solid border-[#eadfcb] bg-[#f7f1e6] px-4 py-4">
      <Text className="m-0 mb-2 text-[12px] font-bold tracking-[0.06em] text-[#92400e] uppercase">
        Or paste this link into your browser
      </Text>
      <Text className="m-0 text-[13px] leading-[1.7] break-all text-[#78350f]">
        {url}
      </Text>
    </Section>
  )
}

export function Fine({ children }: ChildrenProps) {
  return (
    <Text className="m-0 mt-[18px] text-[13px] leading-[1.7] text-[#6b7280]">
      {children}
    </Text>
  )
}

type ChildrenProps = {
  children: ReactNode
}

type ButtonProps = ChildrenProps & {
  href: string
}

type LayoutProps = ChildrenProps & {
  badge: string
  title: string
  subtitle: string
}
