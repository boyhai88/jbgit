import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FolderKanban,
  Settings,
  UsersRound,
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteFooter } from "@/components/footer"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { label: "概览", icon: BriefcaseBusiness, active: true },
  { label: "我的项目", icon: FolderKanban },
  { label: "参与的团队", icon: UsersRound },
  { label: "收益记录", icon: CircleDollarSign },
  { label: "账户设置", icon: Settings },
]

const stats = [
  {
    label: "参与项目数",
    value: "6",
    helper: "3 个进行中",
    icon: FolderKanban,
  },
  {
    label: "协作完成率",
    value: "92%",
    helper: "高于平台平均",
    icon: CheckCircle2,
  },
  {
    label: "协作者数",
    value: "18",
    helper: "本月新增 4 位",
    icon: UsersRound,
  },
]

const activities = [
  {
    title: "开源 AI 代码审查助手完成 UI 评审",
    description: "你提交的 Dashboard 原型已被 Lin Chen 标记为通过。",
    time: "15 分钟前",
  },
  {
    title: "跨链 DeFi 聚合协议邀请你加入",
    description: "项目发起人希望你负责路由监控面板前端开发。",
    time: "2 小时前",
  },
  {
    title: "收益分成已结算",
    description: "医疗影像标注平台里程碑 2 已完成，分成 $620 已入账。",
    time: "昨天",
  },
  {
    title: "新协作者加入团队",
    description: "Maria R. 加入开源 AI 代码审查助手 DevOps 小组。",
    time: "3 天前",
  },
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#05050B] text-white">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-[#10101A] lg:min-h-[calc(100vh-4rem)] lg:w-[220px] lg:border-b-0 lg:border-r">
          <div className="px-6 py-7">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#6C63FF] text-lg font-bold text-white shadow-[0_0_28px_rgba(108,99,255,0.32)]">
              张
            </div>
            <div className="mt-4">
              <p className="text-lg font-bold text-white">张伟</p>
              <p className="mt-1 truncate text-sm text-white/40">
                zhangwei@jbgit.dev
              </p>
            </div>
          </div>

          <nav className="flex overflow-x-auto border-t border-white/10 lg:block">
            {sidebarItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.label}
                  href={item.active ? "/dashboard" : "#"}
                  className={cn(
                    "flex min-w-max items-center gap-3 px-6 py-4 text-sm font-medium transition-colors lg:min-w-0",
                    item.active
                      ? "border-b-4 border-[#6C63FF] bg-[#6C63FF]/18 text-[#8D87FF] lg:border-b-0 lg:border-l-4"
                      : "text-white/45 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-normal text-white">
                仪表盘
              </h1>
              <p className="mt-3 text-sm text-white/45">
                查看你的项目协作、团队动态和收益进展。
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#10101A] px-4 py-3 text-sm text-white/58">
              当前用户：
              <span className="ml-2 font-medium text-white">张伟</span>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <Card
                  key={stat.label}
                  className="rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/45">{stat.label}</p>
                        <p className="mt-3 font-mono text-4xl text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#6C63FF]/16 text-[#8D87FF]">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-emerald-400">
                      {stat.helper}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-6 rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold text-white">
                  最近活动时间线
                </CardTitle>
                <Bell className="size-5 text-[#8D87FF]" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="space-y-5">
                {activities.map((activity, index) => (
                  <div key={activity.title} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex size-9 items-center justify-center rounded-full border border-[#6C63FF]/35 bg-[#6C63FF]/18 text-[#8D87FF]">
                        <Clock3 className="size-4" aria-hidden="true" />
                      </div>
                      {index < activities.length - 1 ? (
                        <div className="mt-2 h-full min-h-10 w-px bg-white/10" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-semibold text-white">
                          {activity.title}
                        </h2>
                        <span className="text-xs text-white/35">
                          {activity.time}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/50">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <SiteFooter />
    </main>
  )
}
