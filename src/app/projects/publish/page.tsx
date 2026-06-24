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

const percentageOptions = [
  "5",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
  "60",
  "65",
  "70",
  "75",
  "80",
  "85",
  "90",
  "95",
  "100",
]

const forbiddenWords = [
  "色情",
  "暴力",
  "违法",
  "赌博",
  "诈骗",
  "洗钱",
  "毒品",
  "枪支",
  "黑产",
  "攻击",
  "木马",
  "病毒",
]

type PhaseRow = {
  id: number
  name: string
  headcount: string
  sharePercent: string
}

type Notice = {
  type: "success" | "error"
  title: string
  message: string
}

function getContentLength(value: string) {
  return Array.from(value.replace(/\s/g, "")).length
}

function isPureNoise(value: string) {
  const compact = value.replace(/\s/g, "")

  if (!compact) {
    return true
  }

  const isOnlyNumbers = /^[0-9]+$/.test(compact)
  const isOnlySpecialChars = !/[A-Za-z0-9\u4e00-\u9fa5]/.test(compact)
  const hasRepeatedSingleChar =
    compact.length >= 5 && compact.split("").every((char) => char === compact[0])

  return isOnlyNumbers || isOnlySpecialChars || hasRepeatedSingleChar
}

function hasForbiddenContent(value: string) {
  const normalized = value.toLowerCase()

  return forbiddenWords.some((word) => normalized.includes(word.toLowerCase()))
}

export default function PublishProjectPage() {
  const router = useRouter()
  const { loading, user } = useAuth()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [budget, setBudget] = useState(budgetOptions[0])
  const [customSkill, setCustomSkill] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [headcount, setHeadcount] = useState("1")
  const [phaseRows, setPhaseRows] = useState<PhaseRow[]>([
    {
      id: 1,
      name: "",
      headcount: "1",
      sharePercent: percentageOptions[3],
    },
  ])
  const descriptionLength = getContentLength(description)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
    }
  }, [loading, router, user])

  function toggleSkill(skill: string) {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    )
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
        message: "该技能已在预设列表中，请直接点击标签选择。",
      })
      return
    }

    setSelectedSkills((current) =>
      current.includes(value) ? current : [...current, value],
    )
    setCustomSkill("")
  }

  function addPhaseRow() {
    setPhaseRows((rows) => [
      ...rows,
      {
        id: Date.now(),
        name: "",
        headcount: "1",
        sharePercent: percentageOptions[3],
      },
    ])
  }

  function generateAiPhases() {
    const text = description.trim()

    if (!text) {
      setNotice({
        type: "error",
        title: "请先填写项目描述",
        message: "AI 自动拆分需要读取当前项目描述。",
      })
      return
    }

    const normalized = text.toLowerCase()
    const hasAi = normalized.includes("ai") || normalized.includes("llm")
    const hasWeb3 =
      normalized.includes("web3") ||
      normalized.includes("链") ||
      normalized.includes("nft") ||
      normalized.includes("defi")
    const hasBackend =
      normalized.includes("api") ||
      normalized.includes("后端") ||
      normalized.includes("数据库")

    const generated: PhaseRow[] = [
      {
        id: Date.now(),
        name: "需求梳理与技术方案",
        headcount: "1",
        sharePercent: "15",
      },
      {
        id: Date.now() + 1,
        name: hasBackend ? "后端 API 与数据模型" : "核心功能开发",
        headcount: hasBackend ? "2" : "1",
        sharePercent: "25",
      },
      {
        id: Date.now() + 2,
        name: hasAi
          ? "AI 能力集成与调优"
          : hasWeb3
            ? "链上交互与合约集成"
            : "前端界面与交互实现",
        headcount: "2",
        sharePercent: "30",
      },
      {
        id: Date.now() + 3,
        name: "测试验收与上线交付",
        headcount: "1",
        sharePercent: "20",
      },
      {
        id: Date.now() + 4,
        name: "文档沉淀与运营支持",
        headcount: "1",
        sharePercent: "10",
      },
    ]

    setPhaseRows(generated)
    setNotice({
      type: "success",
      title: "AI 已自动拆分工序",
      message: "已根据项目描述生成 5 个工序，可继续手动调整。",
    })
  }

  function removePhaseRow(id: number) {
    setPhaseRows((rows) => rows.filter((row) => row.id !== id))
  }

  function updatePhaseRow(
    id: number,
    field: keyof Omit<PhaseRow, "id">,
    value: string,
  ) {
    setPhaseRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  async function validatePublishRate(userId: string) {
    const supabase = createClient()
    const since24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const since5Minutes = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { count, error: countError } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since24Hours)

    if (countError) {
      return countError.message
    }

    if ((count ?? 0) >= 5) {
      return "同一用户24小时内最多发布5个项目"
    }

    const { data: recentProjects, error: recentError } = await supabase
      .from("projects")
      .select("id, created_at")
      .eq("user_id", userId)
      .gte("created_at", since5Minutes)
      .order("created_at", { ascending: false })
      .limit(1)

    if (recentError) {
      return recentError.message
    }

    if (recentProjects && recentProjects.length > 0) {
      return "发布间隔至少5分钟，请稍后再试"
    }

    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      router.replace("/auth/login")
      return
    }

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("projectName") ?? "").trim()
    const descriptionValue = description.trim()
    const phases = phaseRows
      .map((row) => ({
        name: row.name.trim(),
        headcount: row.headcount.trim(),
        share_percent: row.sharePercent.trim(),
      }))
      .filter(
        (row) =>
          row.name.length > 0 ||
          row.headcount.length > 0 ||
          row.share_percent.length > 0,
      )

    const hasInvalidPhase = phases.some(
      (phase) =>
        !phase.name ||
        !phase.headcount ||
        Number(phase.headcount) <= 0 ||
        !phase.share_percent ||
        Number(phase.share_percent) <= 0,
    )

    if (hasInvalidPhase) {
      setNotice({
        type: "error",
        title: "请完善工序信息",
        message: "已填写的工序需要包含名称、所需人数和分成比例。",
      })
      return
    }

    const phaseShareTotal = phases.reduce(
      (total, phase) => total + Number(phase.share_percent),
      0,
    )

    if (phases.length > 0 && phaseShareTotal !== 100) {
      setNotice({
        type: "error",
        title: "请调整工序分成比例",
        message: `工序分成比例总和必须为100%，当前为${phaseShareTotal}%。`,
      })
      return
    }

    if (
      !name ||
      !descriptionValue ||
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

    if (descriptionLength < 50) {
      setNotice({
        type: "error",
        title: "项目描述太短",
        message: `项目描述至少需要50个字，当前${descriptionLength}个字`,
      })
      return
    }

    if (
      isPureNoise(name) ||
      isPureNoise(descriptionValue) ||
      hasForbiddenContent(name) ||
      hasForbiddenContent(descriptionValue)
    ) {
      setNotice({
        type: "error",
        title: "内容审核未通过",
        message: "内容包含违规词汇，请修改",
      })
      return
    }

    setSubmitting(true)
    setNotice(null)

    const rateLimitError = await validatePublishRate(user.id)

    if (rateLimitError) {
      setSubmitting(false)
      setNotice({
        type: "error",
        title: "发布过于频繁",
        message: rateLimitError,
      })
      return
    }

    const supabase = createClient()
    const payload = {
      name,
      description: descriptionValue,
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

    if (phases.length > 0) {
      const phasePayload = phases.map((phase, index) => ({
        project_id: project.id,
        name: phase.name,
        headcount: Number(phase.headcount),
        share_percent: Number(phase.share_percent),
        sort_order: index + 1,
      }))

      console.log("正在插入项目工序：", phasePayload)

      const { error: phasesError } = await supabase
        .from("project_phases")
        .insert(phasePayload)

      console.log("项目工序插入结果：", { phasesError })

      if (phasesError) {
        setSubmitting(false)
        setNotice({
          type: "error",
          title: "工序保存失败",
          message: phasesError.message,
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
              完善项目需求、预算、技能标签与工序分成。
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
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="description" className="text-white">
                    项目描述
                  </Label>
                  <span
                    className={
                      descriptionLength < 50
                        ? "text-xs text-amber-300"
                        : "text-xs text-emerald-300"
                    }
                  >
                    {descriptionLength}/50 字
                  </span>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="描述项目目标、协作方式和交付要求，至少50个字"
                  className="min-h-32 border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">技能标签</Label>
                <div className="flex flex-wrap gap-2">
                  {presetSkills.map((skill) => {
                    const selected = selectedSkills.includes(skill)

                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={
                          selected
                            ? "rounded-full border border-[#6C63FF] bg-[#6C63FF] px-3 py-1.5 text-xs text-white transition"
                            : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 transition hover:border-[#6C63FF]/60 hover:text-white"
                        }
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>

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
                  <div>
                    <Label className="text-white">工序管理</Label>
                    <p className="mt-1 text-xs text-white/45">
                      在团队设置后拆分项目工序，便于匹配对应技能和人数。
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      onClick={generateAiPhases}
                      className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                    >
                      🤖 AI 自动拆分工序
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPhaseRow}
                      className="border-[#6C63FF]/50 bg-transparent text-[#6C63FF] hover:bg-[#6C63FF]/10 hover:text-white"
                    >
                      + 添加工序
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {phaseRows.map((phase, index) => (
                    <Card
                      key={phase.id}
                      className="rounded-xl border-white/10 bg-black/20 py-0 text-white"
                    >
                      <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#6C63FF] px-3 text-sm font-bold text-white">
                            {`工序 ${index + 1}`}
                          </span>
                        </div>
                        {phaseRows.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removePhaseRow(phase.id)}
                            className="rounded-lg border border-red-500/35 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                          >
                            删除
                          </button>
                        ) : null}
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_160px]">
                          <label className="space-y-2">
                            <Label className="text-xs text-white/55">
                              工序名称
                            </Label>
                            <Input
                              value={phase.name}
                              onChange={(event) =>
                                updatePhaseRow(
                                  phase.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                              placeholder="工序名称"
                              className="h-11 border-white/10 bg-[#11111D] text-base font-semibold text-white placeholder:text-white/35"
                            />
                          </label>

                          <label className="space-y-2">
                            <Label className="text-xs text-white/55">
                              招募人数
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              value={phase.headcount}
                              onChange={(event) =>
                                updatePhaseRow(
                                  phase.id,
                                  "headcount",
                                  event.target.value,
                                )
                              }
                              placeholder="人数"
                              className="h-11 border-white/10 bg-[#11111D] text-white placeholder:text-white/35"
                            />
                          </label>

                          <label className="space-y-2">
                            <Label className="text-xs text-white/55">
                              分成比例
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={phase.sharePercent}
                                onChange={(event) =>
                                  updatePhaseRow(
                                    phase.id,
                                    "sharePercent",
                                    event.target.value,
                                  )
                                }
                                placeholder="比例"
                                className="h-11 border-white/10 bg-[#11111D] pr-8 text-white placeholder:text-white/35"
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/45">
                                %
                              </span>
                            </div>
                          </label>
                        </div>
                      </CardContent>
                    </Card>
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
