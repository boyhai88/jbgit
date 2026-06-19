import { ChevronDown, Plus, Search, UsersRound } from "lucide-react"
import Link from "next/link"

import { SiteFooter } from "@/components/footer"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

type ProjectRow = {
  id: string | number
  name: string | null
  description: string | null
  budget: string | number | null
  skills: string[] | null
  headcount: number | null
  status: string | null
  created_at: string | null
}

const filters = ["全部", "前端", "后端", "全栈", "AI", "DevOps"]

const statusStyles: Record<string, string> = {
  进行中: "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
  招募中: "border-amber-500/30 bg-amber-500/12 text-amber-400",
  即将开始: "border-white/10 bg-white/5 text-white/48",
}

function formatBudget(budget: ProjectRow["budget"]) {
  if (budget === null || budget === undefined || budget === "") {
    return "预算待定"
  }

  if (typeof budget === "number") {
    return `$${budget.toLocaleString()}`
  }

  return budget.startsWith("$") ? budget : `$${budget}`
}

function formatDate(date: string | null) {
  if (!date) {
    return "刚刚发布"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  const projects = (data ?? []) as ProjectRow[]

  return (
    <main className="min-h-screen bg-[#05050B] text-white">
      <section className="mx-auto w-full max-w-[980px] px-6 py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal text-white">
              项目市场
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/48 md:text-base">
              发现全球协作机会，按技能与收益筛选最适合你的项目
            </p>
          </div>

          <Link
            href="/projects/publish"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 rounded-lg bg-[#6C63FF] px-5 text-sm text-white shadow-[0_14px_34px_rgba(108,99,255,0.28)] hover:bg-[#5B54E8]",
            )}
          >
            <Plus className="size-4" aria-hidden="true" />
            发布项目
          </Link>
        </div>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <Input
              placeholder="搜索项目、技能标签..."
              className="h-12 rounded-lg border-white/10 bg-[#10101A] pl-12 text-base text-white placeholder:text-white/35 focus-visible:border-[#6C63FF] focus-visible:ring-[#6C63FF]/25"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={cn(
                  "h-11 rounded-full border px-5 text-sm font-medium transition-colors",
                  index === 0
                    ? "border-[#6C63FF] bg-[#6C63FF]/12 text-[#8D87FF]"
                    : "border-white/10 bg-[#10101A] text-white/65 hover:border-[#6C63FF]/50 hover:text-white",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex h-11 items-center justify-center gap-3 rounded-lg border border-white/10 bg-[#10101A] px-5 text-sm font-medium text-white/75 transition-colors hover:border-[#6C63FF]/50 hover:text-white lg:ml-auto"
          >
            最新发布
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-7 text-sm font-medium text-white/45">
          {projects.length} 个项目
        </p>

        {projects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#10101A] p-10 text-center text-white/55">
            暂无项目
          </div>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const status = project.status || "招募中"
              const tags = project.skills ?? []

              return (
                <Card
                  key={project.id}
                  className="min-h-[214px] rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none transition-colors hover:border-[#6C63FF]/45"
                >
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs text-[#8D87FF]">
                          PR-{String(project.id).slice(0, 6)}
                        </span>
                        <h2 className="mt-2 text-lg font-bold leading-7 tracking-normal text-white">
                          {project.name || "未命名项目"}
                        </h2>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                          statusStyles[status] ??
                            "border-white/10 bg-white/5 text-white/48",
                        )}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-white/48">
                      {project.description || "暂无项目描述"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/16 px-3 py-1 font-mono text-xs text-[#8D87FF]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                      <div className="flex items-center gap-2 text-white/50">
                        <UsersRound className="size-4" aria-hidden="true" />
                        <span>{project.headcount ?? 0} 人</span>
                      </div>
                      <div className="text-white/45">
                        {formatDate(project.created_at)}
                        <span className="ml-3 font-mono font-semibold text-emerald-400">
                          {formatBudget(project.budget)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}
