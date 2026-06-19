import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import { PublishProjectForm } from "./publish-project-form"

export default async function PublishProjectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/projects/publish")
  }

  return (
    <main className="min-h-screen bg-[#05050B] text-white">
      <section className="mx-auto w-full max-w-[980px] px-6 py-10">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
            PROJECT PUBLISHING
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-normal text-white">
            发布项目
          </h1>
          <p className="mt-3 max-w-[620px] text-sm leading-6 text-white/48">
            完成基本信息、技能需求、团队设置与收益分配后，即可发布你的协作项目。
          </p>
        </div>

        <PublishProjectForm />
      </section>
    </main>
  )
}
