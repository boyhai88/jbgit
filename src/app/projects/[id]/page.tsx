"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Project = {
  id: string | number
  user_id: string | null
  name: string | null
  description: string | null
  budget: string | number | null
  skills: string[] | null
  headcount: number | null
  status: string | null
}

type EarningRule = {
  id: string | number
  role: string | null
  contribution_type: string | null
  percentage?: string | number | null
  share_percent?: string | number | null
}

type Milestone = {
  id: string | number
  title: string | null
  description: string | null
  status: string | null
  due_date: string | null
}

type Notice = {
  type: "success" | "error"
  title: string
  message: string
}

const statusStyles: Record<string, string> = {
  招募中: "border-amber-500/30 bg-amber-500/12 text-amber-300",
  进行中: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
}

const milestoneStatusStyles: Record<string, string> = {
  待开始: "border-gray-600 bg-gray-800 text-gray-300",
  进行中: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  已完成: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
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

function formatPercentage(rule: EarningRule) {
  const percentage = rule.share_percent ?? rule.percentage

  if (percentage === null || percentage === undefined || percentage === "") {
    return "待定"
  }

  return `${percentage}%`
}

function formatDate(date: string | null) {
  if (!date) {
    return "未设置"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { loading: authLoading, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [earningRules, setEarningRules] = useState<EarningRule[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loadingProject, setLoadingProject] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const projectId = params.id

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    async function loadProject() {
      const [
        { data: projectData, error },
        { data: earningsData },
        { data: milestonesData },
      ] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase
          .from("project_earnings")
          .select("id, role, contribution_type, percentage, share_percent")
          .eq("project_id", projectId),
        supabase
          .from("project_milestones")
          .select("id, title, description, status, due_date")
          .eq("project_id", projectId)
          .order("due_date", { ascending: true }),
      ])

      if (!mounted) {
        return
      }

      setProject(error || !projectData ? null : (projectData as Project))
      setEarningRules((earningsData ?? []) as EarningRule[])
      setMilestones((milestonesData ?? []) as Milestone[])
      setLoadingProject(false)
    }

    void loadProject().catch(() => {
      if (!mounted) {
        return
      }

      setProject(null)
      setEarningRules([])
      setMilestones([])
      setLoadingProject(false)
    })

    return () => {
      mounted = false
    }
  }, [projectId])

  async function handleApply() {
    if (authLoading) {
      return
    }

    if (!user) {
      router.push("/auth/login")
      return
    }

    setSubmitting(true)
    setNotice(null)

    const supabase = createClient()
    const { data: existingApplication } = await supabase
      .from("project_applications")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingApplication) {
      setSubmitting(false)
      setNotice({
        type: "error",
        title: "已申请，请勿重复提交",
        message: "你的申请已在审核队列中。",
      })
      return
    }

    const { error } = await supabase.from("project_applications").insert({
      project_id: projectId,
      user_id: user.id,
      status: "待审核",
    })

    setSubmitting(false)

    if (error) {
      const isDuplicate =
        error.code === "23505" || error.message.includes("duplicate")

      setNotice({
        type: "error",
        title: isDuplicate ? "已申请，请勿重复提交" : "申请提交失败",
        message: isDuplicate ? "你的申请已在审核队列中。" : error.message,
      })
      return
    }

    setNotice({
      type: "success",
      title: "申请已提交，等待审核",
      message: "项目发起人审核后会与你联系。",
    })
  }

  if (loadingProject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05050B] px-6 text-white">
        <p className="text-base text-white/55">正在加载项目...</p>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#05050B] px-6 py-12 text-white">
        <section className="mx-auto w-full max-w-4xl">
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mb-8 border-gray-800 bg-[#10101A] text-white/70 hover:border-[#6C63FF]/50 hover:text-white",
            )}
          >
            返回项目市场
          </Link>
          <div className="rounded-2xl border border-gray-800 bg-[#10101A] p-10 text-center text-white/55 shadow-lg">
            项目不存在
          </div>
        </section>
      </main>
    )
  }

  const status = project.status || "招募中"
  const skills = project.skills ?? []
  const isProjectOwner = Boolean(user && project.user_id === user.id)

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-12 text-white">
      <section className="mx-auto w-full max-w-5xl">
        <Link
          href="/projects"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mb-8 border-gray-800 bg-[#10101A] text-white/70 hover:border-[#6C63FF]/50 hover:text-white",
          )}
        >
          返回项目市场
        </Link>

        <Card className="rounded-2xl border-gray-800 bg-[#10101A] text-white shadow-lg shadow-black/30">
          <CardHeader className="border-b border-gray-800 p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs text-white/35">
                  项目ID：{project.id}
                </p>
                <CardTitle className="mt-4 text-4xl font-black tracking-normal text-white md:text-5xl">
                  {project.name || "未命名项目"}
                </CardTitle>
                <CardDescription className="mt-5 max-w-3xl text-lg leading-relaxed text-white/60">
                  {project.description || "暂无项目描述"}
                </CardDescription>
              </div>

              <span
                className={cn(
                  "w-fit shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium",
                  statusStyles[status] ??
                    "border-gray-700 bg-white/5 text-white/55",
                )}
              >
                {status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {notice ? (
              <Alert
                className={
                  notice.type === "success"
                    ? "border-[#6C63FF]/50 bg-[#6C63FF]/10 text-white"
                    : "border-red-400/40 bg-red-500/10 text-red-100"
                }
              >
                <AlertTitle>{notice.title}</AlertTitle>
                <AlertDescription>{notice.message}</AlertDescription>
              </Alert>
            ) : null}

            <section className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
              <h2 className="text-xl font-bold text-white">项目描述</h2>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-white/65">
                {project.description || "暂无项目描述"}
              </p>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
              <h2 className="text-xl font-bold text-white">技能标签</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/16 px-4 py-1.5 font-mono text-sm text-[#8D87FF]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-base text-white/45">暂无技能标签</span>
                )}
              </div>
            </section>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
                <p className="text-base text-white/45">招募人数</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {project.headcount ?? 0} 人
                </p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
                <p className="text-base text-white/45">项目预算</p>
                <p className="mt-3 text-3xl font-bold text-[#6C63FF]">
                  {formatBudget(project.budget)}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">项目进度</h2>
                  <p className="mt-2 text-base leading-relaxed text-white/45">
                    项目里程碑、状态和截止日期
                  </p>
                </div>
                {isProjectOwner ? (
                  <Button
                    type="button"
                    className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                  >
                    添加里程碑
                  </Button>
                ) : null}
              </div>

              {milestones.length === 0 ? (
                <div className="mt-6 rounded-xl border border-gray-800 bg-white/[0.03] p-5 text-base text-white/45">
                  暂无里程碑
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {milestones.map((milestone) => {
                    const milestoneStatus = milestone.status || "待开始"

                    return (
                      <div
                        key={milestone.id}
                        className="rounded-xl border border-gray-800 bg-white/[0.03] p-5 shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {milestone.title || "未命名里程碑"}
                            </h3>
                            <p className="mt-3 text-base leading-relaxed text-white/55">
                              {milestone.description || "暂无描述"}
                            </p>
                            <p className="mt-3 text-sm text-white/35">
                              截止日期：{formatDate(milestone.due_date)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                              milestoneStatusStyles[milestoneStatus] ??
                                milestoneStatusStyles["待开始"],
                            )}
                          >
                            {milestoneStatus}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">收益分配</h2>
                  <p className="mt-2 text-base leading-relaxed text-white/45">
                    项目角色、贡献类型与分成比例
                  </p>
                </div>
                {isProjectOwner ? (
                  <Button
                    type="button"
                    className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                  >
                    管理收益分配
                  </Button>
                ) : null}
              </div>

              {earningRules.length === 0 ? (
                <div className="mt-6 rounded-xl border border-gray-800 bg-white/[0.03] p-5 text-base text-white/45">
                  暂无收益分配方案
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-xl border border-gray-800">
                  <div className="grid grid-cols-3 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/45">
                    <span>角色</span>
                    <span>贡献类型</span>
                    <span className="text-right">分成比例</span>
                  </div>
                  {earningRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="grid grid-cols-3 border-t border-gray-800 px-5 py-4 text-base text-white/70"
                    >
                      <span>{rule.role || "未设置"}</span>
                      <span>{rule.contribution_type || "未设置"}</span>
                      <span className="text-right font-mono text-[#8D87FF]">
                        {formatPercentage(rule)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex justify-end border-t border-gray-800 pt-8">
              <Button
                type="button"
                disabled={authLoading || submitting}
                onClick={handleApply}
                className="h-11 bg-[#6C63FF] px-8 text-white hover:bg-[#5B54E8]"
              >
                {submitting ? "提交中..." : "申请加入"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
