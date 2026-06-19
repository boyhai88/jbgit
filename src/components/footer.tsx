import Link from "next/link"

const footerColumns = [
  {
    title: "产品",
    links: ["项目市场", "发布项目", "仪表盘"],
  },
  {
    title: "公司",
    links: ["关于我们", "帮助中心", "隐私政策"],
  },
  {
    title: "联系",
    links: ["hello@jbgit.dev", "Twitter/X", "GitHub"],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B0B12]">
      <div className="mx-auto grid w-full max-w-[980px] gap-8 px-6 py-8 md:grid-cols-[1.25fr_1.75fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#6C63FF] text-xs text-white shadow-[0_0_28px_rgba(108,99,255,0.26)]">
              JB
            </span>
            <span className="text-lg text-white">JBGIT</span>
          </Link>
          <p className="mt-4 max-w-[320px] text-sm leading-6 text-white/48">
            全球开发者协作与技能变现平台。连接talent，创造价值。
          </p>
          <p className="mt-4 font-mono text-sm text-white/62">
            <span className="text-[#8D87FF]">128K+</span> 开发者
            <span className="mx-2 text-white/22">|</span>
            <span className="text-[#8D87FF]">18.9K</span> 项目
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">
                {column.title}
              </h3>
              <div className="mt-3 grid gap-2 text-sm text-white/42">
                {column.links.map((item) => (
                  <span
                    key={item}
                    className="transition-colors hover:text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export function SiteFooter() {
  return <Footer />
}
