import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const filterTags = ['全部', 'React', 'Rust', 'Python', 'AI/ML', '区块链', '最新发布']

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  // 如果数据库没有数据，使用静态示例数据
  const displayProjects = projects && projects.length > 0 ? projects : [
    {
      id: '1',
      name: '开源 AI 代码审查助手',
      description: '构建基于 LLM 的 PR 审查工具，集成 GitHub Actions，支持多语言代码审查。',
      skills: ['React', 'TypeScript', 'AI/ML'],
      headcount: 4,
      budget: '8500',
      status: '招募中'
    },
    {
      id: '2',
      name: '跨链 DeFi 聚合协议',
      description: '开发多链资产路由引擎，优化 gas 费用与成本，需要 Rust 与智能合约经验。',
      skills: ['Rust', 'Solidity', '区块链'],
      headcount: 5,
      budget: '12000',
      status: '招募中'
    },
    {
      id: '3',
      name: '医疗影像标注平台',
      description: '为放射科医生提供 DICOM 标注工具，含 AI 辅助预测标注与质量控制模块。',
      skills: ['Python', 'FastAPI', 'AI/ML'],
      headcount: 3,
      budget: '6200',
      status: '招募中'
    },
    {
      id: '4',
      name: '开发者文档搜索引擎',
      description: '语义化搜索 API 文档与 Stack Overflow，支持 VS Code 插件集成。',
      skills: ['React', 'Node.js', 'Elasticsearch'],
      headcount: 2,
      budget: '4500',
      status: '招募中'
    },
    {
      id: '5',
      name: '边缘计算 IoT 网关',
      description: '工业传感器数据采集与边缘推理，低延迟协议栈与设备管理平台。',
      skills: ['Rust', 'Python', '嵌入式'],
      headcount: 5,
      budget: '9800',
      status: '招募中'
    },
    {
      id: '6',
      name: 'NFT 创作者工具套件',
      description: '无代码 NFT 铸造与版权管理，含创作者仪表盘与链上分析。',
      skills: ['React', 'Web3.js', '区块链'],
      headcount: 4,
      budget: '7200',
      status: '招募中'
    }
  ]

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">项目市场</h1>
            <p className="text-gray-400">发现全球协作机会，按技能与收益筛选最适合你的项目</p>
          </div>
          <Link href="/projects/publish">
            <button className="bg-[#6C63FF] text-white px-4 py-2 rounded-lg hover:bg-[#5a52d6]">
              + 发布项目
            </button>
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {filterTags.map((tag, index) => (
            <Link
              key={tag}
              href={tag === '全部' ? '/projects' : `/projects?filter=${encodeURIComponent(tag)}`}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                index === 0
                  ? 'border-[#6C63FF] bg-[#6C63FF] text-white'
                  : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-[#6C63FF] hover:text-[#6C63FF]'
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project: any) => (
            <div key={project.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-[#6C63FF] transition">
              <h2 className="text-xl font-semibold text-white">{project.name}</h2>
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.skills?.map((skill: string) => (
                  <span key={skill} className="bg-[#6C63FF]/20 text-[#6C63FF] px-3 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-400">{project.headcount || 0} 人</span>
                <span className="text-[#6C63FF] font-medium">${project.budget || 0}</span>
              </div>
              <Link href={`/projects/${project.id}`}>
                <button className="w-full mt-4 border border-[#6C63FF] text-[#6C63FF] px-4 py-2 rounded-lg hover:bg-[#6C63FF] hover:text-white transition">
                  查看详情
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
