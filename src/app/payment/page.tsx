"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

export default function PaymentPage() {
  const router = useRouter()
  const [cardNumber, setCardNumber] = useState("")
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")

  function handlePayment() {
    setError("")

    if (cardNumber.replace(/\s/g, "").length < 12) {
      setError("支付失败，请填写有效的信用卡信息")
      return
    }

    setPaying(true)

    window.setTimeout(() => {
      setPaying(false)
      router.push("/skills/valuation")
    }, 800)
  }

  return (
    <main className="min-h-screen bg-[#05050B] px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-xl items-center">
        <Card className="w-full rounded-2xl border-white/10 bg-[#10101A] py-0 text-white shadow-2xl shadow-black/30">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-3xl font-black text-white">
              解锁完整估值报告
            </CardTitle>
            <CardDescription className="text-white/50">
              完整估值报告包含薪资建议、市场排名与技能分析。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6 pt-3">
            <div className="rounded-xl border border-[#6C63FF]/30 bg-[#6C63FF]/10 p-5">
              <p className="text-sm text-white/55">订阅方案</p>
              <p className="mt-2 font-mono text-4xl font-bold text-white">
                $19
                <span className="ml-1 text-base font-medium text-white/50">
                  /月
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card" className="text-white">
                支付方式（模拟）
              </Label>
              <Input
                id="card"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="信用卡支付 · 4242 4242 4242 4242"
                className="border-white/10 bg-black/20 text-white placeholder:text-white/30"
              />
            </div>

            {error ? (
              <Alert className="border-red-500/35 bg-red-500/10 text-red-200">
                <AlertTitle>支付失败</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="button"
              disabled={paying}
              onClick={handlePayment}
              className="h-11 w-full bg-[#6C63FF] text-white hover:bg-[#5B54E8]"
            >
              {paying ? "支付处理中..." : "立即支付 $19"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
