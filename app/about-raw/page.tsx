// import Link from "next/link"
// import { ArrowRight, Search, ShoppingCart, Sparkles, TrendingUp, Zap } from "lucide-react"
// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"

// import { useCartStore } from "@/app/store/cart"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import ProductCard from "@/app/components/product-card"
// import CategoryFilter from "@/app/components/category-filter"

// type AboutData = {
//   title: string
//   description: string
//   team: { name: string; role: string }[]
// }

// async function getAboutData(): Promise<AboutData> {
//   // Replace this with your actual data fetching logic (API, DB, etc.)
//   return {
//     title: "About YOUBAIRIA",
//     description: "YOUBAIRIA is a digital marketplace connecting buyers and sellers.",
//     team: [
//       { name: "Ali", role: "Founder" },
//       { name: "Sara", role: "Developer" },
//       { name: "Ahmed", role: "Designer" },
//     ],
//   }
// }

// export default function AboutPage() {
//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center bg-[#A2C2E0] text-gray-900 px-2">
//       <div className="w-full max-w-xl sm:max-w-2xl rounded-xl shadow-lg bg-white p-6 sm:p-10 border border-[#A2C2E0]">
//         <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center flex items-center gap-2">
//           <span role="img" aria-label="globe">🌐</span>
//           About Youbairia
//         </h1>
//         <p className="text-base sm:text-lg mb-8 text-center font-medium">
//           <span className="font-bold text-[#A2C2E0]">Welcome to Youbairia</span> – The Digital Marketplace for <span className="text-[#B7E4D7]">Builders</span>, <span className="text-[#A2C2E0]">Hustlers</span> & <span className="text-[#B7E4D7]">Creators</span>.<br />
//           <span className="italic text-gray-700">Digital products deserve a digital-first home.</span><br /><br />
//           <span className="font-semibold text-gray-800">We're the operating system for the new-age entrepreneur.</span>
//         </p>

//         <section className="mb-8">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#A2C2E0]">
//             <span role="img" aria-label="rocket">🚀</span>
//             What Makes Youbairia Different?
//           </h2>
//           <ul className="space-y-4 text-base">
//             <li className="bg-[#B7E4D7] rounded-lg p-3">
//               <span className="font-semibold text-[#A2C2E0] flex items-center gap-2"><span role="img" aria-label="store">🛍️</span> Build Your Digital Store in Minutes</span>
//               <div className="ml-7 text-gray-700">Create your online store, list your digital products or services, and start selling—no coding, no hassle.</div>
//             </li>
//             <li className="bg-[#B7E4D7] rounded-lg p-3">
//               <span className="font-semibold text-[#A2C2E0] flex items-center gap-2"><span role="img" aria-label="lock">🔐</span> Secure, Smooth Payments</span>
//               <div className="ml-7 text-gray-700">Integrated with top payment gateways (like Stripe & UPI). Instant payouts. No waiting games.</div>
//             </li>
//             <li className="bg-[#B7E4D7] rounded-lg p-3">
//               <span className="font-semibold text-[#A2C2E0] flex items-center gap-2"><span role="img" aria-label="brain">🧠</span> Smart Tools for Smart Sellers</span>
//               <div className="ml-7 text-gray-700">Automated delivery, subscription billing, license key management, Discord integration, analytics, and more. You focus on growth—we handle the rest.</div>
//             </li>
//             <li className="bg-[#B7E4D7] rounded-lg p-3">
//               <span className="font-semibold text-[#A2C2E0] flex items-center gap-2"><span role="img" aria-label="chart">📊</span> Analytics that Don’t Lie</span>
//               <div className="ml-7 text-gray-700">Know your numbers. Track sales, user behavior, customer retention, and optimize like a pro.</div>
//             </li>
//           </ul>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#B7E4D7]">
//             <span role="img" aria-label="bulb">💡</span>
//             Who’s Youbairia For?
//           </h2>
//           <ul className="space-y-2 text-center text-base font-semibold">
//             <li>🔥 <span className="text-[#A2C2E0]">Digital Product Creators</span> – Sell eBooks, Notion templates, software, and more.</li>
//             <li>🎓 <span className="text-[#B7E4D7]">Course & Webinar Hosts</span> – Run paid Zoom sessions or full-blown academies.</li>
//             <li>🧑‍💻 <span className="text-[#A2C2E0]">SaaS Builders</span> – Launch your micro-SaaS, API, or AI tool. We’ve got you.</li>
//             <li>🌐 <span className="text-[#B7E4D7]">Community Founders</span> – Gate access to your Discord, Telegram, or private forum.</li>
//             <li>🪙 <span className="text-[#A2C2E0]">Crypto & Web3 Projects</span> – Sell NFT access, wallets, utility passes, and digital unlockables.</li>
//           </ul>
//         </section>

//         <section className="mb-8 text-center">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#A2C2E0]">
//             <span role="img" aria-label="compass">🧭</span>
//             Our Mission
//           </h2>
//           <p className="mb-2 text-base font-semibold text-gray-800">
//             We’re here to <span className="text-[#B7E4D7]">empower the future of online entrepreneurship</span>—one creator, one tool, one product at a time.
//           </p>
//           <p className="font-bold text-[#A2C2E0] text-lg">Build. Launch. Grow. Repeat.<br />That’s the Youbairia way.</p>
//         </section>

//         <section className="text-center">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#B7E4D7]">
//             <span role="img" aria-label="speech">💬</span>
//             Join the Movement
//           </h2>
//           <p className="text-base font-semibold text-gray-800">
//             We’re not just a platform—we're a <span className="text-[#A2C2E0]">community</span> of rebels, builders, and visionaries redefining how value is created and sold online.<br /><br />
//             <span className="font-extrabold text-[#B7E4D7] text-lg">Welcome to the future.<br />Welcome to Youbairia.</span>
//           </p>
//         </section>
//       </div>
//     </main>
//   )
// }