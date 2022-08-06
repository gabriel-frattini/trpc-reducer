import { Avatar } from '@/components/avatar'
import { ButtonLink } from '@/components/button-link'
import { Footer } from '@/components/footer'
import { IconButton } from '@/components/icon-button'
import { Logo, SearchIcon, NotificationIcon } from '@/components/icons'
import {
  Menu,
  MenuButton,
  MenuItemButton,
  MenuItemLink,
  MenuItems,
  MenuItemsContent,
} from '@/components/menu'
import { SearchDialog } from '@/components/search-dialog'
import { capitalize } from '@/lib/text'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import * as React from 'react'

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession()
  const { theme, themes, setTheme } = useTheme()
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false)

  if (!session) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-4xl px-6 mx-auto ">
          <header className="flex items-center justify-between gap-4 py-12 mb-12 ">
            <Link href="/">
              <a>
                <Logo className="w-auto text-red-light h-[34px]" />
              </a>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <IconButton
                variant="secondary"
                onClick={() => {
                  setIsSearchDialogOpen(true)
                }}
              >
                <SearchIcon className="w-4 h-4" />
              </IconButton>
              <NotificationIcon />

              <Menu>
                <MenuButton className="relative inline-flex rounded-full group focus-ring"></MenuButton>

                <MenuItems className="w-48">
                  <MenuItemsContent>
                    <MenuItemLink href="sign-in">Profile</MenuItemLink>
                    <MenuItemButton onClick={() => signOut()}>
                      Log out
                    </MenuItemButton>
                  </MenuItemsContent>
                  <div className="flex items-center gap-4 px-4 py-3 rounded-b bg-secondary">
                    <label htmlFor="theme" className="text-sm">
                      Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      value={theme}
                      onChange={(event) => {
                        setTheme(event.target.value)
                      }}
                      className="block w-full py-1.5 text-xs border rounded shadow-sm bg-primary border-secondary"
                    >
                      {themes.map((theme) => (
                        <option key={theme} value={theme}>
                          {capitalize(theme)}
                        </option>
                      ))}
                    </select>
                  </div>
                </MenuItems>
              </Menu>

              <ButtonLink href="/sign-in">
                <span className="sm:hidden">Project</span>
                <span className="hidden sm:block shrink-0">New Project</span>
              </ButtonLink>
            </div>
          </header>

          <main>{children}</main>

          <div className="py-20">
            <Footer />
          </div>

          <SearchDialog
            isOpen={isSearchDialogOpen}
            onClose={() => {
              setIsSearchDialogOpen(false)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <header className="flex border-b-2 items-center justify-between mb-12 py-8 px-8 bg-white">
        <Link href="/">
          <a>
            <Logo className="w-auto text-red-light h-[34px]" />
          </a>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/notifications" replace>
            <NotificationIcon className="cursor-pointer" />
          </Link>
          <Menu>
            <MenuButton className="relative inline-flex rounded-full group focus-ring">
              <Avatar
                name={session!.user.name}
                src={session!.user.image}
                size="sm"
              />
            </MenuButton>

            <MenuItems className="w-48">
              <MenuItemsContent>
                <MenuItemLink href={`/profile/${session!.user.id}`}>
                  Profile
                </MenuItemLink>
                <MenuItemButton onClick={() => signOut()}>
                  Log out
                </MenuItemButton>
              </MenuItemsContent>
              <div className="flex items-center gap-4 px-4 py-3 rounded-b bg-secondary">
                <label htmlFor="theme" className="text-sm">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={theme}
                  onChange={(event) => {
                    setTheme(event.target.value)
                  }}
                  className="block w-full py-1.5 text-xs border rounded shadow-sm bg-primary border-secondary"
                >
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>
                      {capitalize(theme)}
                    </option>
                  ))}
                </select>
              </div>
            </MenuItems>
          </Menu>

          <ButtonLink href="/new">
            <span className="sm:hidden">Project</span>
            <span className="hidden sm:block shrink-0">New Project</span>
          </ButtonLink>
        </div>
      </header>
      <div className="max-w-4xl px-6 mx-auto bg-gray-50">
        <main className="mt-4">{children}</main>

        <div className="py-20">
          <Footer />
        </div>

        <SearchDialog
          isOpen={isSearchDialogOpen}
          onClose={() => {
            setIsSearchDialogOpen(false)
          }}
        />
      </div>
    </div>
  )
}
