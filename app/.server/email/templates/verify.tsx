import { TOKEN_EXPIRES_DAYS as DAYS } from '~/config/constants'
import { Button, Fine, Layout, P, UrlBox } from './components'

export default function Verify({ user, url }: Props) {
  return (
    <Layout
      badge="Verify email"
      title="Welcome in"
      subtitle="Confirm your email address to unlock your account and start publishing forms."
    >
      <P>Hello {user.name || user.email},</P>
      <P>
        Your form starter is ready to go. One quick click confirms this email
        address and turns on the rest of your auth flow.
      </P>
      <Button href={url}>Verify your email</Button>
      <UrlBox url={url} />
      <Fine>
        This link expires in {DAYS} days. If you didn&apos;t create this
        account, you can safely ignore this email.
      </Fine>
    </Layout>
  )
}

Verify.Subject = (props: Props) =>
  props.user.name
    ? `${props.user.name}, verify your email`
    : 'Verify your email'

type Props = {
  user: {
    email: string
    name: string | null
  }
  url: string
}
