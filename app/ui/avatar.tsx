import { cn } from '~/lib/cn'

export function Avatar({ user, className }: AvatarProps) {
  let url =
    user.bag?.auth?.github?.image_url || user.bag?.auth?.google?.image_url
  let initial = user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()

  return (
    <div className={cn('avatar avatar-placeholder', className)}>
      <div className="size-full rounded-full bg-neutral text-neutral-content">
        {url ? (
          <img src={url} alt={user.name ?? 'User'} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    </div>
  )
}

type AvatarProps = {
  user: { email: string; name: string | null; bag: any }
  className?: string
}
