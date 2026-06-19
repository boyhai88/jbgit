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
  name: string | null
  description: string | null
  budget: string | number | null
  skills: string[] | null
  headcount: number | null
  status: string | null
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

function formatBudget(budget: Project["budget"]) {
  if (budget === null || budget === undefined || budget === "") {
    return "预算待定"
  }

  if (typeof budget === "number") {
    return `$${budget.toLocaleString()}`
  }

  return budget.startsWith("$") ? budget : `$${budget}`
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { loading: authLoading, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const projectId = params.id

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (!mounted) {
        return
      }

      if (error || !data) {
        setProject(null)
      } else {
        setProject(data as Project)
      }

      setLoadingProject(false)
    }

    void loadProject().catch(() => {
        if (!mounted) {
          return
        }

        setProject(null)
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
        <p className="text-sm text-white/55">正在加载项目...</p>
      </main>
    )
  }

  if (!project) {
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
          <div className="rounded-xl border border-white/10 bg-[#10101A] p-10 text-center text-white/55">
            项目不存在
          </div>
        </section>
      </main>
    )
  }

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
              <Button
                type="button"
                disabled={authLoading || submitting}
                onClick={handleApply}
                className="h-10 bg-[#6C63FF] px-6 text-white hover:bg-[#5B54E8]"
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
