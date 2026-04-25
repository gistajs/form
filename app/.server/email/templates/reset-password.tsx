import { TOKEN_EXPIRES_DAYS as DAYS } from '~/config/constants'
import { Button, Fine, Layout, P, UrlBox } from './components'

export default function ResetPassword({ url }: Props) {
  return (
    <Layout
      badge="Reset password"
      title="Password reset request"
      subtitle="Use the secure link below to choose a new password and get back into your account."
    >
      <P>
        We received a request to reset the password for your account. If that
        was you, continue with the button below.
      </P>
      <Button href={url}>Reset your password</Button>
      <UrlBox url={url} />
      <Fine>
        This link expires in {DAYS} days. If you didn&apos;t request a password
        reset, you can ignore this email.
      </Fine>
    </Layout>
  )
}

ResetPassword.Subject = (_props: Props) => 'Reset your password'

type Props = {
  url: string
}
