"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { UserMenu } from "@/components/auth/user-menu"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "项目市场" },
  { href: "/dashboard", label: "仪表盘" },
] as const

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav() {
  const pathname = usePathname()

  if (pathname.startsWith("/auth")) {
    return null
  }

  return (
    <header className="border-b border-white/10 bg-[#05050B] text-white">
      <nav className="mx-auto flex h-16 w-full max-w-[980px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#6C63FF] text-xs text-white shadow-[0_0_28px_rgba(108,99,255,0.32)]">
            JB
          </span>
          <span className="text-lg">JBGIT</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-white/50 md:flex">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "transition-colors hover:text-white",
                  isActive && "text-white",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <UserMenu variant="dark" />
      </nav>
    </header>
  )
}
