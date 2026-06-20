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

const presetSkills = [
  "React",
  "TypeScript",
  "Python",
  "Rust",
  "Solidity",
  "AI/ML",
  "DevOps",
  "Next.js",
  "Node.js",
  "Web3",
  "Go",
  "Java",
  "C++",
  "Vue",
  "Angular",
]

const budgetOptions = [
  "1000",
  "2000",
  "3000",
  "4000",
  "5000",
  "6000",
  "7000",
  "8000",
  "9000",
  "10000",
  "20000",
  "30000",
  "40000",
  "50000",
  "60000",
  "70000",
  "80000",
  "90000",
  "100000",
]

const roleOptions = [
  "前端开发",
  "后端开发",
  "全栈开发",
  "AI工程师",
  "DevOps工程师",
  "产品经理",
  "UI设计师",
]

const contributionOptions = [
  "功能开发",
  "页面开发",
  "API开发",
  "数据库设计",
  "架构设计",
  "测试",
  "文档",
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
  const [budget, setBudget] = useState(budgetOptions[0])
  const [customSkill, setCustomSkill] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [headcount, setHeadcount] = useState("1")
  const [revenueRows, setRevenueRows] = useState<RevenueRow[]>([
    {
      id: 1,
      role: roleOptions[0],
      contribution: contributionOptions[0],
      percentage: "",
    },
  ])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
    }
  }, [loading, router, user])

  function setPresetSkills(values: string[]) {
    const customSkills = selectedSkills.filter(
      (skill) => !presetSkills.includes(skill),
    )

    setSelectedSkills([...values, ...customSkills])
  }

  function addCustomSkill() {
    const value = customSkill.trim()

    if (!value) {
      return
    }

    if (presetSkills.includes(value)) {
      setNotice({
        type: "error",
        title: "请从预设标签中选择",
        message: "该技能已在预设列表中，请直接从下拉列表选择。",
      })
      return
    }

    setSelectedSkills((current) =>
      current.includes(value) ? current : [...current, value],
    )
    setCustomSkill("")
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    )
  }

  function addRevenueRow() {
    setRevenueRows((rows) => [
      ...rows,
      {
        id: Date.now(),
        role: roleOptions[0],
        contribution: contributionOptions[0],
        percentage: "",
      },
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
    const payload = {
      name,
      description,
      budget: Number(budget),
      skills: selectedSkills,
      headcount: Number(headcount),
      status: "招募中",
      user_id: user.id,
    }

    console.log("正在插入项目：", payload)

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert(payload)
      .select("id")
      .single()

    console.log("项目插入结果：", { project, projectError })

    if (projectError || !project) {
      setSubmitting(false)
      setNotice({
        type: "error",
        title: "项目发布失败",
        message:
          projectError?.message ??
          "未能创建项目，请检查 projects 表字段和 RLS 权限。",
      })
      return
    }

    if (earnings.length > 0) {
      const earningPayload = earnings.map((earning) => ({
        project_id: project.id,
        user_id: user.id,
        role: earning.role,
        contribution_type: earning.contribution_type,
        share_percent: Number(earning.share_percent),
      }))

      console.log("正在插入收益分配：", earningPayload)

      const { error: earningsError } = await supabase
        .from("project_earnings")
        .insert(earningPayload)

      console.log("收益分配插入结果：", { earningsError })

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
                  <select
                    id="budget"
                    name="budget"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                    required
                  >
                    {budgetOptions.map((value) => (
                      <option key={value} value={value} className="bg-[#11111D]">
                        {Number(value).toLocaleString()} 元
                      </option>
                    ))}
                  </select>
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
                <Label htmlFor="preset-skills" className="text-white">
                  技能标签
                </Label>
                <select
                  id="preset-skills"
                  multiple
                  value={selectedSkills.filter((skill) =>
                    presetSkills.includes(skill),
                  )}
                  onChange={(event) =>
                    setPresetSkills(
                      Array.from(event.target.selectedOptions, (option) =>
                        option.value,
                      ),
                    )
                  }
                  className="min-h-40 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                >
                  {presetSkills.map((skill) => (
                    <option key={skill} value={skill} className="bg-[#11111D]">
                      {skill}
                    </option>
                  ))}
                </select>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input
                    value={customSkill}
                    onChange={(event) => setCustomSkill(event.target.value)}
                    placeholder="输入预设中没有的自定义技能"
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  />
                  <Button
                    type="button"
                    onClick={addCustomSkill}
                    className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                  >
                    添加自定义
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedSkills.length > 0 ? (
                    selectedSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/16 px-3 py-1 text-xs text-[#8D87FF] transition hover:border-red-400/50 hover:text-red-200"
                      >
                        {skill} x
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-white/40">
                      请至少选择或添加一个技能标签
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headcount" className="text-white">
                  招募人数
                </Label>
                <select
                  id="headcount"
                  name="headcount"
                  value={headcount}
                  onChange={(event) => setHeadcount(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                  required
                >
                  {Array.from({ length: 20 }, (_, index) => String(index + 1)).map(
                    (value) => (
                      <option key={value} value={value} className="bg-[#11111D]">
                        {value} 人
                      </option>
                    ),
                  )}
                </select>
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
                      <select
                        value={row.role}
                        onChange={(event) =>
                          updateRevenueRow(row.id, "role", event.target.value)
                        }
                        className="h-10 rounded-lg border border-white/10 bg-[#11111D] px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                      >
                        {roleOptions.map((role) => (
                          <option
                            key={role}
                            value={role}
                            className="bg-[#11111D]"
                          >
                            {role}
                          </option>
                        ))}
                      </select>
                      <select
                        value={row.contribution}
                        onChange={(event) =>
                          updateRevenueRow(
                            row.id,
                            "contribution",
                            event.target.value,
                          )
                        }
                        className="h-10 rounded-lg border border-white/10 bg-[#11111D] px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                      >
                        {contributionOptions.map((contribution) => (
                          <option
                            key={contribution}
                            value={contribution}
                            className="bg-[#11111D]"
                          >
                            {contribution}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={row.percentage}
                        onChange={(event) =>
                          updateRevenueRow(
                            row.id,
                            "percentage",
                            event.target.value,
                          )
                        }
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
