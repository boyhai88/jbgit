import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function getSkills(skills: unknown) {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill).trim())
      .filter((skill) => skill.length > 0)
  }

  if (typeof skills === 'string') {
    return skills
      .replace(/^\[|\]$/g, '')
      .replaceAll('"', '')
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
  }

  return []
}

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project: any) => {
              const skills = getSkills(project.skills)

              return (
                <div key={project.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                  <p className="text-gray-400 text-sm mt-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.length > 0 &&
                      skills.map((skill) => (
                        <span key={`${project.id}-${skill}`} className="bg-[#6C63FF]/20 text-[#6C63FF] px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                    <span>招募 {project.headcount || 0} 人</span>
                    <span>${project.budget}</span>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <button className="w-full mt-4 border border-[#6C63FF] text-[#6C63FF] px-4 py-2 rounded-lg hover:bg-[#6C63FF] hover:text-white transition">
                      查看详情
                    </button>
                  </Link>
                </div>
              )
            })
          ) : (
            <p className="text-gray-500 col-span-3 text-center py-12">暂无项目</p>
          )}
        </div>
      </div>
    </main>
  )
}
