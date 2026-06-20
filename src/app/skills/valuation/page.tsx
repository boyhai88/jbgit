"use client"

import { useState } from "react"

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

const stacks = [
  "React",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Node.js",
  "Vue",
  "Java",
  "C++",
]

const trend = [68, 72, 75, 79, 83, 87]

export default function SkillValuationPage() {
  const [stack, setStack] = useState("React")
  const [years, setYears] = useState("3")
  const [showResult, setShowResult] = useState(false)

  function handleValuation() {
    setShowResult(true)
  }

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
      <section className="mx-auto w-full max-w-[980px]">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C63FF]">
            JBGIT SKILL INTELLIGENCE
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
            技能估值
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/50 md:text-base">
            AI驱动的技能市场公允价值
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold text-white">
                估值参数
              </CardTitle>
              <CardDescription className="text-white/45">
                选择技术栈和经验年限，生成技能市场参考价。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="stack" className="text-white">
                  技术栈
                </Label>
                <select
                  id="stack"
                  value={stack}
                  onChange={(event) => setStack(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-[#6C63FF] focus:ring-3 focus:ring-[#6C63FF]/20"
                >
                  {stacks.map((item) => (
                    <option key={item} value={item} className="bg-[#10101A]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years" className="text-white">
                  经验年限
                </Label>
                <Input
                  id="years"
                  type="number"
                  min="1"
                  max="20"
                  value={years}
                  onChange={(event) => setYears(event.target.value)}
                  className="border-white/10 bg-black/20 text-white placeholder:text-white/35"
                />
              </div>

              <Button
                type="button"
                onClick={handleValuation}
                className="h-10 w-full bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
              >
                开始估值
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/10 bg-[#10101A] py-0 text-white shadow-none">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold text-white">
                估值结果
              </CardTitle>
              <CardDescription className="text-white/45">
                完整估值报告 $19/月
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {showResult ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm text-white/45">估值分数</p>
                      <p className="mt-3 font-mono text-4xl font-bold text-white">
                        87/100
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm text-white/45">市场排名</p>
                      <p className="mt-3 text-xl font-bold text-[#8D87FF]">
                        超过72%的开发者
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm text-white/45">建议薪资范围</p>
                      <p className="mt-3 text-xl font-bold text-emerald-300">
                        ¥25,000 - ¥35,000/月
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {stack} 技能趋势
                        </p>
                        <p className="mt-1 text-sm text-white/40">
                          基于 {years || 1} 年经验的近6个月估值变化
                        </p>
                      </div>
                      <span className="rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/15 px-3 py-1 text-xs text-[#8D87FF]">
                        +19%
                      </span>
                    </div>

                    <div className="mt-6 flex h-40 items-end gap-3">
                      {trend.map((value, index) => (
                        <div
                          key={value}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-t-lg bg-[#6C63FF] shadow-[0_0_24px_rgba(108,99,255,0.28)]"
                            style={{ height: `${value}%` }}
                          />
                          <span className="text-xs text-white/35">
                            {index + 1}月
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/45">
                  点击“开始估值”查看技能市场价值
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
