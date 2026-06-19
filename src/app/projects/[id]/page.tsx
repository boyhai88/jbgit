import Link from "next/link"
import { notFound } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

type Project = {
  id: string | number
  name: string | null
  description: string | null
  budget: string | number | null
  skills: string[] | null
  headcount: number | null
  status: string | null
}

type ProjectDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

const statusStyles: Record<string, string> = {
  招募中: "border-amber-500/30 bg-amber-500/12 text-amber-300",
  进行中: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
}

function formatBudget(budget: Project["budget"]) {
  if (budget === null || budget === undefined || budget === "") {
    return "预算待定"
  }

  if (typeof budget === "number") {
    return `$${budget.toLocaleString()}`
  }

  return budget.startsWith("$") ? budget : `$${budget}`
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!data) {
    notFound()
  }

  const project = data as Project
  const status = project.status || "招募中"
  const skills = project.skills ?? []

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
      <section className="mx-auto w-full max-w-[980px]">
        <Link
          href="/projects"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mb-6 border-white/10 bg-[#10101A] text-white/70 hover:border-[#6C63FF]/50 hover:text-white",
          )}
        >
          返回项目市场
        </Link>

        <Card className="border-white/10 bg-[#10101A] text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <CardHeader className="border-b border-white/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs text-white/35">
                  项目ID：{project.id}
                </p>
                <CardTitle className="mt-3 text-3xl font-black tracking-normal md:text-4xl">
                  {project.name || "未命名项目"}
                </CardTitle>
                <CardDescription className="mt-3 text-base leading-7 text-white/55">
                  {project.description || "暂无项目描述"}
                </CardDescription>
              </div>

              <span
                className={cn(
                  "w-fit shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium",
                  statusStyles[status] ??
                    "border-white/10 bg-white/5 text-white/55",
                )}
              >
                {status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-6">
            <div>
              <h2 className="text-sm font-semibold text-white/80">项目描述</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/60">
                {project.description || "暂无项目描述"}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white/80">技能标签</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/16 px-3 py-1 font-mono text-xs text-[#8D87FF]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/45">暂无技能标签</span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/45">招募人数</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {project.headcount ?? 0} 人
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/45">项目预算</p>
                <p className="mt-2 text-2xl font-bold text-[#6C63FF]">
                  {formatBudget(project.budget)}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-6">
              <Button className="h-10 bg-[#6C63FF] px-6 text-white hover:bg-[#5B54E8]">
                申请加入
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
