import { LockKeyholeIcon } from 'lucide-react'
import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-base-200 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-lg bg-base-100 px-8 py-8 shadow-lg shadow-base-300">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-base-200 p-3">
            <LockKeyholeIcon className="size-6" />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
