import { notFound } from "next/navigation"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ProjectStatus = "进行中" | "招募中"

type Sponsor = {
  name: string
  location: string
  initials: string
}

type TeamMember = {
  name: string
  role: string
  initials: string
  open?: boolean
}

type RevenueShare = {
  role: string
  contribution: string
  share: string
}

type Project = {
  id: string
  title: string
  status: ProjectStatus
  sponsor: Sponsor
  description: string[]
  skills: string[]
  members: TeamMember[]
  openRole: string
  budget: string
  memberProgress: string
  duration: string
  milestones: string
  revenueShares: RevenueShare[]
}

const projects: Project[] = [
  {
    id: "ai-code-review",
    title: "开源 AI 代码审查助手",
    status: "进行中",
    sponsor: {
      name: "Lin Chen",
      location: "项目发起人 · 旧金山",
      initials: "LC",
    },
    description: [
      "我们正在构建一款开源 AI 代码审查助手，深度集成 GitHub Actions 与 GitLab CI。核心能力包括：基于 LLM 的 PR diff 分析、安全漏洞检测、代码风格建议，以及可定制的审查规则引擎。",
      "项目采用 MIT 协议，目标在 Q3 发布 v1.0。团队已有基础架构与模型 pipeline，现场募前端与 DevOps 方向开发者完成 UI 面板与 CI 插件。",
    ],
    skills: ["React", "TypeScript", "Node.js", "GitHub Actions", "LLM API", "Docker"],
    members: [
      { name: "Lin Chen", role: "发起人 / ML", initials: "LC" },
      { name: "Alex Kim", role: "后端", initials: "AK" },
      { name: "Maria R.", role: "DevOps", initials: "MR" },
    ],
    openRole: "前端",
    budget: "$8,500",
    memberProgress: "3 / 4",
    duration: "8 周",
    milestones: "2 / 4",
    revenueShares: [
      { role: "项目发起人", contribution: "架构 + ML Pipeline", share: "35%" },
      { role: "后端开发", contribution: "API + 审查引擎", share: "25%" },
      { role: "DevOps", contribution: "CI 集成 + 部署", share: "15%" },
      { role: "前端开发（招募）", contribution: "Dashboard UI", share: "25%" },
    ],
  },
  {
    id: "defi-aggregator",
    title: "跨链 DeFi 聚合协议",
    status: "招募中",
    sponsor: {
      name: "Nora Zhang",
      location: "项目发起人 · 新加坡",
      initials: "NZ",
    },
    description: [
      "我们正在开发多链资产路由引擎，为交易者自动比较不同链上的流动性、gas 成本与滑点。系统将接入主流 DEX、桥协议与风控模块，为策略团队提供可审计的聚合执行层。",
      "当前合约原型已经完成，需要 Rust、Solidity 与数据工程方向成员一起完善模拟器、路由策略与监控面板，目标在 10 周内完成测试网上线。",
    ],
    skills: ["Rust", "Solidity", "TypeScript", "The Graph", "区块链", "DeFi"],
    members: [
      { name: "Nora Zhang", role: "发起人 / 合约", initials: "NZ" },
      { name: "Owen Park", role: "后端", initials: "OP" },
    ],
    openRole: "Rust 工程师",
    budget: "$12,000",
    memberProgress: "2 / 5",
    duration: "10 周",
    milestones: "1 / 5",
    revenueShares: [
      { role: "项目发起人", contribution: "协议设计 + 合约", share: "30%" },
      { role: "后端开发", contribution: "路由服务 + API", share: "20%" },
      { role: "Rust 工程师（招募）", contribution: "模拟器 + 执行层", share: "25%" },
      { role: "数据工程（招募）", contribution: "链上索引 + 监控", share: "25%" },
    ],
  },
  {
    id: "medical-imaging",
    title: "医疗影像标注平台",
    status: "进行中",
    sponsor: {
      name: "Grace Liu",
      location: "项目发起人 · 多伦多",
      initials: "GL",
    },
    description: [
      "项目面向放射科医生与医学 AI 团队，提供 DICOM 影像标注、病例任务分配、质量复核与模型预标注能力。平台将支持多人协作审阅，并记录完整的标注版本历史。",
      "当前后端 API 与基础标注画布已经完成，团队正在招募前端与 AI 工程成员，推进交互优化、模型服务接入与医院试点部署。",
    ],
    skills: ["Python", "FastAPI", "React", "DICOM", "AI/ML", "PostgreSQL"],
    members: [
      { name: "Grace Liu", role: "发起人 / 医疗 AI", initials: "GL" },
      { name: "Sam Patel", role: "后端", initials: "SP" },
      { name: "Yi Wang", role: "产品", initials: "YW" },
    ],
    openRole: "前端",
    budget: "$6,200",
    memberProgress: "3 / 4",
    duration: "6 周",
    milestones: "2 / 3",
    revenueShares: [
      { role: "项目发起人", contribution: "医学流程 + AI 方案", share: "35%" },
      { role: "后端开发", contribution: "影像 API + 权限", share: "25%" },
      { role: "产品设计", contribution: "标注流程 + 试点", share: "15%" },
      { role: "前端开发（招募）", contribution: "DICOM Viewer UI", share: "25%" },
    ],
  },
]

const statusStyles: Record<ProjectStatus, string> = {
  进行中: "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
  招募中: "border-amber-500/30 bg-amber-500/12 text-amber-400",
}

type ProjectDetailPageProps = {
  params: {
    id: string
  }
}

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }))
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = projects.find((item) => item.id === params.id)

  if (!project) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#05050B] text-white">
      <section className="mx-auto w-full max-w-[900px] px-6 pb-20 pt-3">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-medium text-white/45 transition-colors hover:text-white"
        >
          ← 返回项目市场
        </Link>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-black leading-tight tracking-normal text-white md:text-5xl">
                  {project.title}
                </h1>
                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <span
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium",
                      statusStyles[project.status],
                    )}
                  >
                    {project.status}
                  </span>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10 bg-[#6C63FF]">
                      <AvatarFallback className="bg-gradient-to-br from-[#14A8D4] to-[#6C63FF] text-sm font-bold text-white">
                        {project.sponsor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">
                        {project.sponsor.name}
                      </p>
                      <p className="mt-1 text-sm text-white/45">
                        {project.sponsor.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="text-sm font-bold text-white/55">项目描述</h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-white/72">
                {project.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-sm font-bold text-white/55">所需技能</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/16 px-4 py-1.5 font-mono text-xs text-[#8D87FF]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-sm font-bold text-white/55">当前团队成员</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {project.members.map((member) => (
                  <Card
                    key={member.name}
                    className="rounded-lg border-white/10 bg-[#10101A] py-0 text-center text-white shadow-none"
                  >
                    <CardContent className="p-5">
                      <Avatar className="mx-auto size-12 bg-[#1B1855]">
                        <AvatarFallback className="bg-[#1B1855] text-[#8D87FF]">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="mt-4 font-semibold text-white">
                        {member.name}
                      </p>
                      <p className="mt-1 text-sm text-white/42">
                        {member.role}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                <Card className="rounded-lg border-dashed border-white/10 bg-[#10101A]/50 py-0 text-center text-white shadow-none">
                  <CardContent className="p-5">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#1B1855] text-xl text-[#8D87FF]">
                      +
                    </div>
                    <p className="mt-4 font-semibold text-white/55">招募中</p>
                    <p className="mt-1 text-sm text-white/35">
                      {project.openRole}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-sm font-bold text-white/55">收益分配方案</h2>
              <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#10101A]">
                <div className="grid grid-cols-[1fr_1.55fr_0.6fr] border-b border-white/10 px-4 py-4 text-sm font-medium text-white/38">
                  <span>角色</span>
                  <span>贡献类型</span>
                  <span className="text-right">分成比例</span>
                </div>
                {project.revenueShares.map((item) => (
                  <div
                    key={item.role}
                    className="grid grid-cols-[1fr_1.55fr_0.6fr] border-b border-white/10 px-4 py-4 text-sm text-white/72 last:border-b-0"
                  >
                    <span>{item.role}</span>
                    <span>{item.contribution}</span>
                    <span className="text-right">{item.share}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <Card className="rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none lg:sticky lg:top-24">
            <CardContent className="p-6">
              <div className="divide-y divide-white/10">
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="font-medium text-white/72">项目总预算</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {project.budget}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-white/72">当前成员</span>
                  <span className="font-mono text-white/75">
                    {project.memberProgress}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-white/72">预计周期</span>
                  <span className="font-mono text-white/75">
                    {project.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-white/72">里程碑</span>
                  <span className="font-mono text-white/75">
                    {project.milestones}
                  </span>
                </div>
              </div>

              <Link
                href={`/projects/${project.id}/apply`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-7 h-12 w-full rounded-lg bg-[#6C63FF] text-base text-white hover:bg-[#5B54E8]",
                )}
              >
                申请加入
              </Link>
              <p className="mt-5 text-center text-sm text-white/35">
                提交申请后，发起人将在 48h 内回复
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
