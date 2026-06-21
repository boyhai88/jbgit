"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

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

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function EnterpriseCreatePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState("")
  const generatedSlug = useMemo(() => createSlug(name), [name])
  const displaySlug = slug || generatedSlug

  function handleNameChange(value: string) {
    setName(value)

    if (!slug) {
      setError("")
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("请填写企业名称")
      return
    }

    if (!displaySlug) {
      setError("请填写企业标识")
      return
    }

    router.push("/enterprise/dashboard")
  }

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-2xl items-center">
        <Card className="w-full rounded-2xl border-white/10 bg-[#10101A] py-0 text-white shadow-2xl shadow-black/30">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-3xl font-black text-white">
              创建企业
            </CardTitle>
            <CardDescription className="text-white/50">
              创建企业空间，统一管理项目、成员与协作数据。
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="enterprise-name" className="text-white">
                  企业名称
                </Label>
                <Input
                  id="enterprise-name"
                  required
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="例如：JBGIT Labs"
                  className="border-white/10 bg-black/20 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enterprise-description" className="text-white">
                  企业简介
                </Label>
                <Textarea
                  id="enterprise-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="介绍企业方向、团队规模或项目需求"
                  className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enterprise-slug" className="text-white">
                  企业标识
                </Label>
                <Input
                  id="enterprise-slug"
                  value={displaySlug}
                  onChange={(event) => setSlug(createSlug(event.target.value))}
                  placeholder="用于企业 URL"
                  className="border-white/10 bg-black/20 text-white placeholder:text-white/30"
                />
                <p className="text-xs text-white/40">
                  企业 URL：
                  <span className="text-[#8D87FF]">
                    /enterprise/{displaySlug || "your-company"}
                  </span>
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-11 w-full bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
              >
                创建企业
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
