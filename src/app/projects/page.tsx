import { ChevronDown, Plus, Search, UsersRound } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteFooter } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ProjectStatus = "进行中" | "招募中" | "即将开始"

type Project = {
  id: string
  title: string
  description: string
  tags: string[]
  members: number
  budget: string
  updatedAt: string
  status: ProjectStatus
}

const filters = ["全部", "前端", "后端", "全栈", "AI", "DevOps"]

const projects: Project[] = [
  {
    id: "PR3-001",
    title: "开源 AI 代码审查助手",
    description:
      "构建基于 LLM 的 PR 审查工具，集成 GitHub Actions，支持多语言代码仓库。",
    tags: ["React", "TypeScript", "AI"],
    members: 4,
    budget: "$8,500",
    updatedAt: "2小时前更新",
    status: "进行中",
  },
  {
    id: "PR3-002",
    title: "跨链 DeFi 聚合协议",
    description:
      "开发多链资产路由引擎，优化 gas 费用与滑点，需要 Rust 与智能合约经验。",
    tags: ["Rust", "Solidity", "Web3"],
    members: 6,
    budget: "$12,000",
    updatedAt: "今天更新",
    status: "招募中",
  },
  {
    id: "PR3-003",
    title: "医疗影像标注平台",
    description:
      "为放射科医生提供 DICOM 标注工具，包含 AI 辅助预标注与质量控制模块。",
    tags: ["Python", "FastAPI", "AI"],
    members: 3,
    budget: "$6,200",
    updatedAt: "昨天更新",
    status: "进行中",
  },
  {
    id: "PR3-004",
    title: "开发者文档搜索引擎",
    description:
      "语义化搜索 API 文档与 Stack Overflow 内容，支持 VS Code 插件集成。",
    tags: ["Next.js", "Node.js", "Search"],
    members: 2,
    budget: "$4,500",
    updatedAt: "2天前更新",
    status: "招募中",
  },
  {
    id: "PR3-005",
    title: "边缘计算 IoT 网关",
    description:
      "工业传感器数据采集与边缘推理，构建低延迟协议栈与设备管理平台。",
    tags: ["Rust", "Python", "DevOps"],
    members: 5,
    budget: "$9,800",
    updatedAt: "3天前更新",
    status: "进行中",
  },
  {
    id: "PR3-006",
    title: "NFT 创作者工具套件",
    description:
      "无代码 NFT 铸造与版税管理，包含创作者仪表盘与链上数据分析。",
    tags: ["React", "Web3.js", "设计系统"],
    members: 4,
    budget: "$7,200",
    updatedAt: "本周更新",
    status: "即将开始",
  },
]

const statusStyles: Record<ProjectStatus, string> = {
  进行中: "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
  招募中: "border-amber-500/30 bg-amber-500/12 text-amber-400",
  即将开始: "border-white/10 bg-white/5 text-white/48",
}

export default function ProjectsPage() {
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
            href="/projects/new"
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

        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="min-h-[214px] rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none transition-colors hover:border-[#6C63FF]/45"
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-[#8D87FF]">
                      {project.id}
                    </span>
                    <h2 className="mt-2 text-lg font-bold leading-7 tracking-normal text-white">
                      {project.title}
                    </h2>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                      statusStyles[project.status],
                    )}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="mt-4 min-h-[48px] text-sm leading-6 text-white/48">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
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
                    <span>{project.members} 人</span>
                  </div>
                  <div className="text-white/45">
                    {project.updatedAt}
                    <span className="ml-3 font-mono font-semibold text-emerald-400">
                      {project.budget}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
