"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

const skills = [
  "React",
  "TypeScript",
  "Python",
  "Rust",
  "Solidity",
  "AI/ML",
  "DevOps",
]

type RevenueRow = {
  id: number
  role: string
  contribution: string
  percentage: string
}

type Notice = {
  type: "success" | "error"
  title: string
  message: string
}

export default function PublishProjectPage() {
  const router = useRouter()
  const { loading, user } = useAuth()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [revenueRows, setRevenueRows] = useState<RevenueRow[]>([
    { id: 1, role: "", contribution: "", percentage: "" },
  ])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
    }
  }, [loading, router, user])

  function addRevenueRow() {
    setRevenueRows((rows) => [
      ...rows,
      { id: Date.now(), role: "", contribution: "", percentage: "" },
    ])
  }

  function updateRevenueRow(
    id: number,
    field: keyof Omit<RevenueRow, "id">,
    value: string,
  ) {
    setRevenueRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      router.replace("/auth/login")
      return
    }

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("projectName") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const budget = String(formData.get("budget") ?? "").trim()
    const selectedSkills = formData.getAll("skills").map(String)
    const headcount = String(formData.get("headcount") ?? "").trim()
    const earnings = revenueRows
      .map((row) => ({
        role: row.role.trim(),
        contribution_type: row.contribution.trim(),
        share_percent: row.percentage.trim(),
      }))
      .filter(
        (row) =>
          row.role.length > 0 ||
          row.contribution_type.length > 0 ||
          row.share_percent.length > 0,
      )

    if (
      !name ||
      !description ||
      !budget ||
      selectedSkills.length === 0 ||
      !headcount
    ) {
      setNotice({
        type: "error",
        title: "请填写所有必填字段",
        message: "项目名称、项目描述、项目预算、技能标签和招募人数不能为空。",
      })
      return
    }

    setSubmitting(true)
    setNotice(null)

    const supabase = createClient()
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        description,
        budget: Number(budget),
        skills: selectedSkills,
        headcount: Number(headcount),
        status: "招募中",
        user_id: user.id,
      })
      .select("id")
      .single()

    if (projectError || !project) {
      setSubmitting(false)
      setNotice({
        type: "error",
        title: "项目发布失败",
        message: projectError?.message ?? "未能创建项目，请稍后重试。",
      })
      return
    }

    if (earnings.length > 0) {
      const { error: earningsError } = await supabase
        .from("project_earnings")
        .insert(
          earnings.map((earning) => ({
            project_id: project.id,
            user_id: user.id,
            role: earning.role,
            contribution_type: earning.contribution_type,
            share_percent: Number(earning.share_percent),
          })),
        )

      if (earningsError) {
        setSubmitting(false)
        setNotice({
          type: "error",
          title: "收益分配保存失败",
          message: earningsError.message,
        })
        return
      }
    }

    setNotice({
      type: "success",
      title: "项目发布成功！",
      message: "正在跳转到项目市场。",
    })

    router.push("/projects")
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-6 text-white">
        <p className="text-sm text-white/60">正在读取登录状态...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] px-6 py-10 text-white">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C63FF]">
            JBGIT PROJECT
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            发布项目
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            填写项目信息，匹配合适的开发者伙伴
          </p>
        </div>

        <Card className="border-white/10 bg-[#11111D] text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <CardHeader>
            <CardTitle className="text-xl">项目信息</CardTitle>
            <CardDescription className="text-white/55">
              完善项目需求、预算、技能标签与收益分配。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-white">
                    项目名称
                  </Label>
                  <Input
                    id="project-name"
                    name="projectName"
                    placeholder="输入项目名称"
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/35"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white">
                    项目预算
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    placeholder="输入预算金额"
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/35"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  项目描述
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="描述项目目标、协作方式和交付要求"
                  className="min-h-32 border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">技能标签</Label>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <label key={skill} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="skills"
                        value={skill}
                        className="peer sr-only"
                      />
                      <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition peer-checked:border-[#6C63FF] peer-checked:bg-[#6C63FF] peer-checked:text-white hover:border-[#6C63FF]/70 hover:text-white">
                        {skill}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headcount" className="text-white">
                  招募人数
                </Label>
                <Input
                  id="headcount"
                  name="headcount"
                  type="number"
                  min="1"
                  placeholder="输入招募人数"
                  className="border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-white">收益分配</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRevenueRow}
                    className="border-[#6C63FF]/50 bg-transparent text-[#6C63FF] hover:bg-[#6C63FF]/10 hover:text-white"
                  >
                    + 添加一行
                  </Button>
                </div>

                <div className="space-y-3">
                  {revenueRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_160px]"
                    >
                      <Input
                        value={row.role}
                        onChange={(event) =>
                          updateRevenueRow(row.id, "role", event.target.value)
                        }
                        name={`role-${row.id}`}
                        placeholder="角色名称"
                        className="border-white/10 bg-[#11111D] text-white placeholder:text-white/35"
                      />
                      <Input
                        value={row.contribution}
                        onChange={(event) =>
                          updateRevenueRow(
                            row.id,
                            "contribution",
                            event.target.value,
                          )
                        }
                        name={`contribution-${row.id}`}
                        placeholder="贡献类型"
                        className="border-white/10 bg-[#11111D] text-white placeholder:text-white/35"
                      />
                      <Input
                        value={row.percentage}
                        onChange={(event) =>
                          updateRevenueRow(
                            row.id,
                            "percentage",
                            event.target.value,
                          )
                        }
                        name={`percentage-${row.id}`}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="分成比例"
                        className="border-white/10 bg-[#11111D] text-white placeholder:text-white/35"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t border-white/10 pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-10 bg-[#6C63FF] px-6 text-white hover:bg-[#5B54E8]"
                >
                  {submitting ? "发布中..." : "发布项目"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
