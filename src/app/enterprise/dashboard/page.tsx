import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

const members = [
  { name: "Lin Chen", role: "前端开发", joinedAt: "2026-06-20" },
  { name: "Maya Patel", role: "产品经理", joinedAt: "2026-06-18" },
  { name: "Alex Kim", role: "后端开发", joinedAt: "2026-06-16" },
  { name: "Nora Zhang", role: "UI设计师", joinedAt: "2026-06-14" },
  { name: "Ethan Wu", role: "AI工程师", joinedAt: "2026-06-12" },
]

export default function EnterpriseDashboardPage() {
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
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold text-white">
                最近加入成员
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-4">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-sm font-bold text-white">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {member.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-300">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-300">
                    {member.joinedAt}
                  </span>
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
    </main>
  )
}
