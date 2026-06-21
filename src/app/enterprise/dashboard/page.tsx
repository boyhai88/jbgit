"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Member = {
  id: number
  name: string
  email: string
  role: "owner" | "admin" | "member"
  status: "已加入" | "待接受"
  joinedAt: string
}

const enterprise = {
  name: "JBGIT Labs",
  slug: "jbgit-labs",
  status: "活跃",
  description: "面向全球开发者的远程协作与项目交付团队。",
}

const stats = [
  { label: "成员数", value: "28" },
  { label: "进行中项目", value: "6" },
  { label: "已完成项目", value: "42" },
  { label: "总收益", value: "$128,600" },
]

const initialMembers: Member[] = [
  {
    id: 1,
    name: "Lin Chen",
    email: "lin@jbgit.dev",
    role: "owner",
    status: "已加入",
    joinedAt: "2026-06-20",
  },
  {
    id: 2,
    name: "Maya Patel",
    email: "maya@jbgit.dev",
    role: "admin",
    status: "已加入",
    joinedAt: "2026-06-18",
  },
  {
    id: 3,
    name: "Alex Kim",
    email: "alex@jbgit.dev",
    role: "member",
    status: "已加入",
    joinedAt: "2026-06-16",
  },
  {
    id: 4,
    name: "Nora Zhang",
    email: "nora@jbgit.dev",
    role: "member",
    status: "已加入",
    joinedAt: "2026-06-14",
  },
  {
    id: 5,
    name: "Ethan Wu",
    email: "ethan@jbgit.dev",
    role: "member",
    status: "已加入",
    joinedAt: "2026-06-12",
  },
]

export default function EnterpriseDashboardPage() {
  const [members, setMembers] = useState(initialMembers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState("")

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = inviteEmail.trim()

    if (!email || !email.includes("@")) {
      setInviteError("请输入有效邮箱")
      return
    }

    const invitedMember: Member = {
      id: Date.now(),
      name: email.split("@")[0],
      email,
      role: "member",
      status: "待接受",
      joinedAt: new Date().toISOString().slice(0, 10),
    }

    setMembers((current) => [invitedMember, ...current])
    setInviteEmail("")
    setInviteError("")
    setInviteOpen(false)
  }

  function handleRemoveMember(memberId: number) {
    setMembers((current) => current.filter((member) => member.id !== memberId))
  }

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C63FF]">
              ENTERPRISE DASHBOARD
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
              {enterprise.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-gray-300">
                /enterprise/{enterprise.slug}
              </span>
              <span className="rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1 text-emerald-300">
                订阅状态：{enterprise.status}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300">
              {enterprise.description}
            </p>
          </div>

          <Link
            href="/enterprise/create"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#6C63FF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5B54E8]"
          >
            企业设置
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-2xl border-white/10 bg-[#10101A] py-0 text-white shadow-none"
            >
              <CardContent className="p-6">
                <p className="text-sm text-gray-300">{stat.label}</p>
                <p className="mt-4 font-mono text-4xl font-bold text-white">
                  {stat.value}
                </p>
                <div className="mt-5 h-1.5 rounded-full bg-[#6C63FF]/20">
                  <div className="h-full w-2/3 rounded-full bg-[#6C63FF]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-2xl border-white/10 bg-[#10101A] py-0 text-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-2">
              <CardTitle className="text-xl font-bold text-white">
                成员列表
              </CardTitle>
              <Button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
              >
                邀请成员
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-4">
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-sm font-bold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-white">
                          {member.name}
                        </p>
                        <span className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/15 px-2 py-0.5 text-xs text-[#8D87FF]">
                          {member.role}
                        </span>
                        <span
                          className={
                            member.status === "待接受"
                              ? "rounded-full border border-amber-500/35 bg-amber-500/12 px-2 py-0.5 text-xs text-amber-300"
                              : "rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2 py-0.5 text-xs text-emerald-300"
                          }
                        >
                          {member.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-300">
                        {member.email} · {member.joinedAt}
                      </p>
                    </div>
                  </div>

                  {member.role !== "owner" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveMember(member.id)}
                      className="border-red-500/35 bg-transparent text-red-200 hover:bg-red-500/10 hover:text-red-100"
                    >
                      移除
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-300">企业主</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-[#10101A] py-0 text-white shadow-none">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold text-white">
                企业设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-4">
              <p className="text-sm leading-6 text-gray-300">
                修改企业名称、简介、标识，保持企业资料与团队定位一致。
              </p>
              <div className="grid gap-3">
                {["修改名称", "修改简介", "修改标识"].map((item) => (
                  <Link
                    key={item}
                    href="/enterprise/create"
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#6C63FF] hover:text-[#8D87FF]"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {inviteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-member-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#10101A] p-6 text-white shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="invite-member-title"
                  className="text-xl font-bold text-white"
                >
                  邀请成员
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  输入成员邮箱，发送企业邀请。新成员默认角色为 member。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="关闭邀请对话框"
              >
                关闭
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleInvite}>
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="text-white">
                  成员邮箱
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => {
                    setInviteEmail(event.target.value)
                    setInviteError("")
                  }}
                  placeholder="developer@example.com"
                  className="border-white/10 bg-black/20 text-white placeholder:text-white/30"
                />
              </div>

              {inviteError ? (
                <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {inviteError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                  className="border-white/10 bg-transparent text-white hover:bg-white/10"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                >
                  发送邀请
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  )
}
