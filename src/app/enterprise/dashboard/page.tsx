import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

type EnterpriseRow = {
  id: string
  name: string | null
  slug: string | null
  status: string | null
  description: string | null
}

type MemberRow = {
  id: string | number
  email: string | null
  role: string | null
  status: string | null
  created_at: string | null
}

type ProjectRow = {
  id: string | number
  status: string | null
  budget: string | number | null
}

function formatDate(date: string | null) {
  if (!date) {
    return "刚刚"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

function getMemberName(email: string | null) {
  if (!email) {
    return "未命名成员"
  }

  return email.split("@")[0]
}

function formatRevenue(projects: ProjectRow[]) {
  const total = projects
    .filter((project) => project.status === "已完成")
    .reduce((sum, project) => {
      const value =
        typeof project.budget === "number"
          ? project.budget
          : Number(project.budget ?? 0)

      return sum + (Number.isFinite(value) ? value : 0)
    }, 0)

  return `$${total.toLocaleString()}`
}

export default async function EnterpriseDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: enterpriseData, error: enterpriseError } = await supabase
    .from("enterprises")
    .select("id, name, slug, status, description")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (enterpriseError) {
    console.error("读取企业数据失败:", enterpriseError)
  }

  if (!enterpriseData) {
    return (
      <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
        <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center justify-center">
          <Card className="w-full rounded-2xl border-white/10 bg-[#10101A] py-0 text-center text-white shadow-none">
            <CardContent className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C63FF]">
                ENTERPRISE DASHBOARD
              </p>
              <h1 className="mt-4 text-3xl font-black text-white">
                请先创建企业
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-300">
                当前账号还没有拥有的企业。创建企业后即可查看成员、项目和收益数据。
              </p>
              <Link
                href="/enterprise/create"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#6C63FF] px-5 text-sm font-medium text-white transition-colors hover:bg-[#5B54E8]"
              >
                创建企业
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    )
  }

  const enterprise = enterpriseData as EnterpriseRow

  const [{ data: membersData }, { data: projectsData }] = await Promise.all([
    supabase
      .from("enterprise_members")
      .select("id, email, role, status, created_at")
      .eq("enterprise_id", enterprise.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("projects")
      .select("id, status, budget")
      .eq("enterprise_id", enterprise.id),
  ])

  const members = (membersData ?? []) as MemberRow[]
  const projects = (projectsData ?? []) as ProjectRow[]
  const activeProjects = projects.filter(
    (project) => project.status === "进行中",
  ).length
  const completedProjects = projects.filter(
    (project) => project.status === "已完成",
  ).length
  const stats = [
    { label: "成员数", value: String(members.length) },
    { label: "进行中项目", value: String(activeProjects) },
    { label: "已完成项目", value: String(completedProjects) },
    { label: "总收益", value: formatRevenue(projects) },
  ]

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C63FF]">
              ENTERPRISE DASHBOARD
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
              {enterprise.name || "未命名企业"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-gray-300">
                /enterprise/{enterprise.slug || "未设置"}
              </span>
              <span
                className={
                  enterprise.status === "已过期"
                    ? "rounded-full border border-red-500/35 bg-red-500/12 px-3 py-1 text-red-300"
                    : "rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1 text-emerald-300"
                }
              >
                订阅状态：{enterprise.status || "活跃"}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300">
              {enterprise.description || "暂无企业简介"}
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
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold text-white">
                成员列表
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-4">
              {members.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-gray-300">
                  暂无成员
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-sm font-bold text-white">
                        {getMemberName(member.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-white">
                            {getMemberName(member.email)}
                          </p>
                          <span className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/15 px-2 py-0.5 text-xs text-[#8D87FF]">
                            {member.role || "member"}
                          </span>
                          <span
                            className={
                              member.status === "待接受"
                                ? "rounded-full border border-amber-500/35 bg-amber-500/12 px-2 py-0.5 text-xs text-amber-300"
                                : "rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2 py-0.5 text-xs text-emerald-300"
                            }
                          >
                            {member.status || "已加入"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-300">
                          {member.email} · {formatDate(member.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
                企业数据来自数据库，并通过服务端 Supabase 客户端按当前用户读取。
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
    </main>
  )
}
