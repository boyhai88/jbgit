"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
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

type Review = {
  id: string | number
  reviewer_id: string | null
  reviewee_id: string | null
  rating: number | null
  category: string | null
  comment: string | null
  status: string | null
  created_at: string | null
}

type ProjectApplication = {
  id: string | number
  user_id: string | null
  applicant_email: string | null
  status: string | null
  created_at: string | null
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

const reviewCategories = ["专业技能", "协作能力", "交付质量", "沟通效率"]

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

function formatPerson(id: string | null) {
  if (!id) {
    return "未知用户"
  }

  return `用户 ${id.slice(0, 8)}`
}

function renderStars(rating: number | null) {
  const value = Math.max(0, Math.min(5, rating ?? 0))

  return "★".repeat(value) + "☆".repeat(5 - value)
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { loading: authLoading, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [earningRules, setEarningRules] = useState<EarningRule[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [canReview, setCanReview] = useState(false)
  const [loadingProject, setLoadingProject] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewRating, setReviewRating] = useState("5")
  const [reviewCategory, setReviewCategory] = useState(reviewCategories[0])
  const [reviewComment, setReviewComment] = useState("")
  const projectId = params.id

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    async function loadProject() {
      const [
        { data: projectData, error },
        { data: earningsData },
        { data: milestonesData },
        { data: reviewsData },
        { data: applicationsData },
        { data: applicationData },
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
        supabase
          .from("user_reviews")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_applications")
          .select("id, user_id, status, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        user
          ? supabase
              .from("project_applications")
              .select("id, status")
              .eq("project_id", projectId)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])

      const loadedProject = error || !projectData ? null : (projectData as Project)
      const applicationRows = (applicationsData ?? []) as Array<{
        id: string | number
        user_id: string | null
        status: string | null
        created_at: string | null
      }>
      const applicantIds = Array.from(
        new Set(
          applicationRows
            .map((application) => application.user_id)
            .filter((id): id is string => Boolean(id)),
        ),
      )
      const { data: applicantUsersData } =
        applicantIds.length > 0
          ? await supabase.from("users").select("id, email").in("id", applicantIds)
          : { data: [] }
      const applicantEmailMap = new Map(
        ((applicantUsersData ?? []) as Array<{ id: string; email: string | null }>).map(
          (applicant) => [applicant.id, applicant.email],
        ),
      )
      const applicationsWithUsers = applicationRows.map((application) => ({
        ...application,
        applicant_email: application.user_id
          ? applicantEmailMap.get(application.user_id) ?? "未知邮箱"
          : "未知邮箱",
      }))

      if (!mounted) {
        return
      }

      setProject(loadedProject)
      setEarningRules((earningsData ?? []) as EarningRule[])
      setMilestones((milestonesData ?? []) as Milestone[])
      setApplications(applicationsWithUsers)
      const visibleReviews = ((reviewsData ?? []) as Review[]).filter((review) => {
        if (review.status === "已通过") {
          return true
        }

        return (
          Boolean(user && review.reviewer_id === user.id) &&
          (review.status === "待审核" || review.status === "已拒绝")
        )
      })

      setReviews(visibleReviews)
      setCanReview(Boolean(user && (loadedProject?.user_id === user.id || applicationData)))
      setLoadingProject(false)
    }

    void loadProject().catch(() => {
      if (!mounted) {
        return
      }

      setProject(null)
      setEarningRules([])
      setMilestones([])
      setReviews([])
      setApplications([])
      setCanReview(false)
      setLoadingProject(false)
    })

    return () => {
      mounted = false
    }
  }, [projectId, user])

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

  async function handleUpdateApplication(
    applicationId: string | number,
    status: "已通过" | "已拒绝",
  ) {
    if (!user || !project || project.user_id !== user.id) {
      router.push("/auth/login")
      return
    }

    setNotice(null)

    const supabase = createClient()
    const { error } = await supabase
      .from("project_applications")
      .update({ status })
      .eq("id", applicationId)
      .eq("project_id", projectId)

    if (error) {
      setNotice({
        type: "error",
        title: "申请状态更新失败",
        message: error.message,
      })
      return
    }

    const { data: refreshedApplications } = await supabase
      .from("project_applications")
      .select("id, user_id, status, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
    const refreshedRows = (refreshedApplications ?? []) as Array<{
      id: string | number
      user_id: string | null
      status: string | null
      created_at: string | null
    }>
    const refreshedUserIds = Array.from(
      new Set(
        refreshedRows
          .map((application) => application.user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    )
    const { data: refreshedUsers } =
      refreshedUserIds.length > 0
        ? await supabase
            .from("users")
            .select("id, email")
            .in("id", refreshedUserIds)
        : { data: [] }
    const refreshedEmailMap = new Map(
      ((refreshedUsers ?? []) as Array<{ id: string; email: string | null }>).map(
        (applicant) => [applicant.id, applicant.email],
      ),
    )

    setApplications(
      refreshedRows.map((application) => ({
        ...application,
        applicant_email: application.user_id
          ? refreshedEmailMap.get(application.user_id) ?? "未知邮箱"
          : "未知邮箱",
      })),
    )
    setNotice({
      type: "success",
      title: status === "已通过" ? "审核成功" : "已拒绝",
      message:
        status === "已通过"
          ? "申请状态已更新为已通过。"
          : "申请状态已更新为已拒绝。",
    })
  }

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user || !project) {
      router.push("/auth/login")
      return
    }

    const comment = reviewComment.trim()

    if (!comment) {
      setNotice({
        type: "error",
        title: "请填写评语",
        message: "评价内容不能为空。",
      })
      return
    }

    setSubmittingReview(true)
    setNotice(null)

    const supabase = createClient()
    const reviewPayload = {
      project_id: projectId,
      reviewer_id: user.id,
      reviewee_id: project.user_id ?? user.id,
      rating: Number(reviewRating),
      category: reviewCategory,
      comment,
      status: "待审核",
    }

    const { data, error } = await supabase
      .from("user_reviews")
      .insert(reviewPayload)
      .select("*")
      .single()

    setSubmittingReview(false)

    if (error) {
      setNotice({
        type: "error",
        title: "评价提交失败",
        message: error.message,
      })
      return
    }

    const savedReview = {
      ...(data as Review),
      status: (data as Review).status ?? "待审核",
    }

    setReviews((current) => [savedReview, ...current])
    setReviewComment("")
    setNotice({
      type: "success",
      title: "评价已发布",
      message: "感谢你的反馈。",
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
                  <h2 className="text-xl font-bold text-white">申请人列表</h2>
                  <p className="mt-2 text-base leading-relaxed text-white/45">
                    查看当前项目的申请人、申请时间和审核状态
                  </p>
                </div>
                {isProjectOwner ? (
                  <span className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/15 px-3 py-1 text-xs text-[#8D87FF]">
                    项目所有者可审核
                  </span>
                ) : null}
              </div>

              {applications.length === 0 ? (
                <div className="mt-6 rounded-xl border border-gray-800 bg-white/[0.03] p-5 text-base text-white/45">
                  暂无申请人
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {applications.map((application) => {
                    const applicationStatus = application.status || "待审核"
                    const statusClass =
                      applicationStatus === "已通过"
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : applicationStatus === "已拒绝"
                          ? "border-red-500/40 bg-red-500/15 text-red-300"
                          : "border-amber-500/40 bg-amber-500/15 text-amber-300"

                    return (
                      <div
                        key={application.id}
                        className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-white/[0.03] p-5 shadow-md sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {application.applicant_email || "未知邮箱"}
                          </p>
                          <p className="mt-2 text-sm text-white/35">
                            申请时间：{formatDate(application.created_at)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium",
                              statusClass,
                            )}
                          >
                            {applicationStatus}
                          </span>
                          {isProjectOwner ? (
                            <>
                              <Button
                                type="button"
                                disabled={applicationStatus === "已通过"}
                                onClick={() =>
                                  void handleUpdateApplication(
                                    application.id,
                                    "已通过",
                                  )
                                }
                                className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                              >
                                通过
                              </Button>
                              <Button
                                type="button"
                                disabled={applicationStatus === "已拒绝"}
                                onClick={() =>
                                  void handleUpdateApplication(
                                    application.id,
                                    "已拒绝",
                                  )
                                }
                                variant="outline"
                                className="border-red-500/40 bg-transparent text-red-200 hover:bg-red-500/10 hover:text-red-100"
                              >
                                拒绝
                              </Button>
                            </>
                          ) : null}
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

            <section className="rounded-2xl border border-gray-800 bg-black/20 p-6 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">项目评价</h2>
                  <p className="mt-2 text-base leading-relaxed text-white/45">
                    项目参与者的协作反馈和交付评价
                  </p>
                </div>
                {canReview ? (
                  <span className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/15 px-3 py-1 text-xs text-[#8D87FF]">
                    可发表评价
                  </span>
                ) : null}
              </div>

              {canReview ? (
                <form
                  className="mt-6 rounded-xl border border-gray-800 bg-white/[0.03] p-5"
                  onSubmit={handleSubmitReview}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm text-white/70">
                      评分
                      <select
                        value={reviewRating}
                        onChange={(event) => setReviewRating(event.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11111D] px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option
                            key={rating}
                            value={rating}
                            className="bg-[#11111D]"
                          >
                            {rating} 星
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm text-white/70">
                      分类
                      <select
                        value={reviewCategory}
                        onChange={(event) =>
                          setReviewCategory(event.target.value)
                        }
                        className="h-10 rounded-lg border border-white/10 bg-[#11111D] px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                      >
                        {reviewCategories.map((category) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-[#11111D]"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <Textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="写下你的协作体验、交付反馈或专业评价"
                    className="mt-4 min-h-28 border-white/10 bg-[#11111D] text-white placeholder:text-white/35"
                  />

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
                    >
                      {submittingReview ? "提交中..." : "发表评价"}
                    </Button>
                  </div>
                </form>
              ) : null}

              {reviews.length === 0 ? (
                <div className="mt-6 rounded-xl border border-gray-800 bg-white/[0.03] p-5 text-base text-white/45">
                  暂无评价
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {reviews.map((review) => {
                    const isOwnReview = user?.id === review.reviewer_id
                    const isPending = isOwnReview && review.status === "待审核"
                    const isRejected = isOwnReview && review.status === "已拒绝"

                    return (
                      <div
                        key={review.id}
                        className="rounded-xl border border-gray-800 bg-white/[0.03] p-5 shadow-md"
                      >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-white">
                              {formatPerson(review.reviewer_id)}
                            </span>
                            <span className="text-sm text-white/35">评价</span>
                            <span className="font-semibold text-white">
                              {formatPerson(review.reviewee_id)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="font-mono text-sm text-[#8D87FF]">
                              {renderStars(review.rating)}
                            </span>
                            <span className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/15 px-3 py-1 text-xs text-[#8D87FF]">
                              {review.category || "未分类"}
                            </span>
                            {isPending ? (
                              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs text-amber-300">
                                审核中
                              </span>
                            ) : null}
                            {isRejected ? (
                              <span className="rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs text-red-300">
                                已拒绝
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-xs text-white/35">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-4 text-base leading-relaxed text-white/60",
                          isRejected && "text-red-200"
                        )}
                      >
                        {isRejected
                          ? "该评价已被管理员移除"
                          : review.comment || "暂无评语"}
                      </p>
                    </div>
                    )
                  })}
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
