"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight-new";
import { getActiveInvoices, Invoice } from '@/lib/supabase/invoices';
import { EnhancedInvoiceCard } from '@/components/invoice/EnhancedInvoiceCard';
import { InvoiceCardSkeleton } from '@/components/invoice/InvoiceCard';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-charcoal text-off-white overflow-x-hidden">
      {/* SECTION 1 — HERO */}
      <section className="min-h-screen w-full flex items-center relative overflow-hidden py-20">
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(145, 40%, 55%, .12) 0, hsla(145, 40%, 45%, .04) 50%, hsla(145, 40%, 35%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(145, 40%, 55%, .08) 0, hsla(145, 40%, 45%, .03) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(145, 40%, 55%, .05) 0, hsla(145, 40%, 35%, .02) 80%, transparent 100%)"
        />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            variants={fadeInUp}
          >
            <img 
              src="/logo.png" 
              alt="ChaiTrade Logo" 
              className="h-10 object-contain"
              onError={(e) => {
                // Hide image if logo doesn't exist yet
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="text-sm tracking-wider font-medium">
              <span className="text-white">Chai</span>
              <span className="text-emerald-400">Trade</span>
            </p>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl mb-6"
            variants={fadeInUp}
          >
            Invoices settle late.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Capital shouldn&apos;t.
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed"
            variants={fadeInUp}
          >
            Convert unpaid MSME invoices into fundable assets with locked capital and automatic settlement.
          </motion.p>

          {/* Feature Badges - Nyvex Style */}
          <motion.div
            className="flex flex-wrap gap-3 mt-8 max-w-2xl"
            variants={fadeInUp}
          >
            {['Blockchain Secured', 'ZK-Verified', 'Auto Settlement'].map((feature) => (
              <div
                key={feature}
                className="bg-white/[0.03] backdrop-blur-sm px-4 py-2 rounded-full border border-white/[0.08] flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-white text-sm font-medium">{feature}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex gap-4 mt-10 flex-col sm:flex-row items-start"
            variants={fadeInUp}
          >
            <Link
              href="/msme"
              className="group inline-block bg-emerald-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              <span className="flex items-center gap-2">
                Upload Invoice
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </Link>
            <Link
              href="/browse"
              className="inline-block border border-white/[0.12] bg-white/[0.03] text-white font-semibold text-base px-8 py-3.5 rounded-xl hover:border-white/[0.2] hover:bg-white/[0.06] transition-all duration-200"
            >
              View Live Demo
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex items-center gap-6"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                Live on Avalanche Fuji
              </p>
            </div>
            <div className="h-3 w-px bg-white/[0.1]" />
            <p className="text-xs text-gray-600">
              Testnet · No real funds
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2 — SYSTEM INVARIANTS */}
      <ScrollReveal>
        <section className="py-32 px-6 lg:px-12 border-t border-medium-gray/20 bg-gradient-to-b from-dark-gray/30 via-dark-gray/10 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(61,139,104,0.08),transparent_60%)]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div className="text-center mb-16" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-2 mb-4" variants={fadeInUp}>
                <div className="h-px w-6 bg-emerald-400/50" />
                <p className="text-xs text-emerald-400 tracking-widest uppercase font-medium">
                  Protocol Guarantees
                </p>
                <div className="h-px w-6 bg-emerald-400/50" />
              </motion.div>
              <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" variants={fadeInUp}>
                Four invariants.
                <br />
                <span className="text-emerald-400">Every transaction.</span>
              </motion.h2>
              <motion.p className="text-base text-gray-400 max-w-2xl mx-auto" variants={fadeInUp}>
                Hardcoded rules that the protocol enforces unconditionally
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
            >
              <InvariantItem
                title="One invoice → one asset"
                failureMessage="double-mint rejected"
              />
              <InvariantItem
                title="Locked until settlement"
                failureMessage="withdraw blocked"
              />
              <InvariantItem
                title="Settlement is irreversible"
                failureMessage="reversal rejected"
              />
              <InvariantItem
                title="Principal ≥ investment"
                failureMessage="underpayment blocked"
              />
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 3 — INTERACTIVE DEMO */}
      <ScrollReveal>
        <section className="py-32 px-6 lg:px-12 bg-charcoal border-t border-b border-emerald-500/10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.05] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <motion.div className="inline-flex items-center gap-2 mb-4" variants={fadeInUp}>
                <div className="h-px w-6 bg-emerald-400/50" />
                <p className="text-xs text-emerald-400 tracking-widest uppercase font-medium">Try It Live</p>
                <div className="h-px w-6 bg-emerald-400/50" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Interactive <span className="text-emerald-400">Demo</span>
              </h2>
              <p className="text-base text-gray-400 max-w-2xl mx-auto">
                Experience the complete invoice financing flow in real-time
              </p>
            </motion.div>

            <motion.div variants={scaleIn}>
              <MacWindow />
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 4 — HOW IT WORKS */}
      <ScrollReveal>
        <section className="py-32 px-6 lg:px-12 border-t border-medium-gray/10 bg-gradient-to-b from-charcoal via-dark-gray/20 to-charcoal relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(61,139,104,0.05),transparent_70%)]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div className="text-center mb-16" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-2 mb-4" variants={fadeInUp}>
                <div className="h-px w-6 bg-emerald-400/50" />
                <p className="text-xs text-emerald-400 tracking-widest uppercase font-medium">
                  How It Works
                </p>
                <div className="h-px w-6 bg-emerald-400/50" />
              </motion.div>
              <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" variants={fadeInUp}>
                State machine flow
              </motion.h2>
              <motion.p className="text-base text-gray-400 max-w-2xl mx-auto" variants={fadeInUp}>
                Every invoice follows a deterministic path from creation to settlement
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
            >
              <StepCard number="01" text="Invoice becomes fundable asset" stateLabel="CREATED → FUNDABLE" isFirst={true} />
              <StepCard number="02" text="Capital locked in escrow" stateLabel="FUNDABLE → LOCKED" />
              <StepCard number="03" text="Buyer payment triggers settlement" stateLabel="LOCKED → SETTLING" />
              <StepCard number="04" text="Principal + interest distributed" stateLabel="SETTLING → SETTLED" isLast={true} />
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 5 — PRIVACY & VERIFICATION */}
      <ScrollReveal>
        <section className="py-32 px-6 lg:px-12 border-t border-medium-gray/10 bg-gradient-to-b from-transparent via-dark-gray/30 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,139,104,0.05),transparent_70%)]" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div className="text-center mb-16" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-2 mb-4" variants={fadeInUp}>
                <div className="h-px w-6 bg-emerald-400/50" />
                <motion.h2
                  className="text-xs text-emerald-400 tracking-widest uppercase font-medium"
                  variants={fadeIn}
                >
                  Privacy First
                </motion.h2>
                <div className="h-px w-6 bg-emerald-400/50" />
              </motion.div>
              <motion.p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" variants={fadeInUp}>
                Zero-knowledge verification
              </motion.p>
              <motion.p className="text-base text-gray-400 max-w-2xl mx-auto" variants={fadeInUp}>
                Prove validity without revealing sensitive data
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
            >
              <motion.div
                className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-red-500/20 rounded-2xl p-10 relative overflow-hidden group backdrop-blur-sm"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 30px 60px -15px rgba(239, 68, 68, 0.25)" }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center border border-red-500/20">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <h3 className="text-lg text-red-400 font-mono tracking-widest uppercase font-bold">Hidden</h3>
                  </div>

                  <ul className="space-y-5">
                    <li className="text-light-gray/80 text-lg md:text-xl flex items-center gap-4 group-hover:text-light-gray transition-colors duration-300">
                      <span className="text-red-400/60 text-2xl font-bold">—</span>
                      <span className="font-medium">Invoice document</span>
                    </li>
                    <li className="text-light-gray/80 text-lg md:text-xl flex items-center gap-4 group-hover:text-light-gray transition-colors duration-300">
                      <span className="text-red-400/60 text-2xl font-bold">—</span>
                      <span className="font-medium">Contract terms</span>
                    </li>
                    <li className="text-light-gray/80 text-lg md:text-xl flex items-center gap-4 group-hover:text-light-gray transition-colors duration-300">
                      <span className="text-red-400/60 text-2xl font-bold">—</span>
                      <span className="font-medium">Financial history</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-10 relative overflow-hidden group backdrop-blur-sm"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.35)" }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <span className="text-3xl text-emerald-400">✓</span>
                    </div>
                    <h3 className="text-lg text-emerald-400 font-mono tracking-widest uppercase font-bold">Proven</h3>
                  </div>

                  <ul className="space-y-5">
                    <li className="text-off-white text-lg md:text-xl flex items-center gap-4 group-hover:text-sage-green-50 transition-colors duration-300">
                      <span className="text-emerald-400 text-2xl font-bold">✓</span>
                      <span className="font-semibold">Invoice authenticity</span>
                    </li>
                    <li className="text-off-white text-lg md:text-xl flex items-center gap-4 group-hover:text-sage-green-50 transition-colors duration-300">
                      <span className="text-emerald-400 text-2xl font-bold">✓</span>
                      <span className="font-semibold">Amount owed</span>
                    </li>
                    <li className="text-off-white text-lg md:text-xl flex items-center gap-4 group-hover:text-sage-green-50 transition-colors duration-300">
                      <span className="text-emerald-400 text-2xl font-bold">✓</span>
                      <span className="font-semibold">Settlement occurred</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 5.5 — ACTIVE INVOICES PREVIEW */}
      <ScrollReveal>
        <section className="py-24 px-6 lg:px-12 border-t border-medium-gray/10 bg-gradient-to-b from-transparent via-charcoal/30 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,139,104,0.05),transparent_60%)]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div className="text-center mb-12" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-2 mb-4" variants={fadeInUp}>
                <div className="h-px w-6 bg-emerald-400/50" />
                <p className="text-xs text-emerald-400 tracking-widest uppercase font-medium">
                  Active Market
                </p>
                <div className="h-px w-6 bg-emerald-400/50" />
              </motion.div>
              <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" variants={fadeInUp}>
                Latest Invoices
              </motion.h2>
              <motion.p className="text-base text-gray-400 max-w-2xl mx-auto" variants={fadeInUp}>
                Browse and fund verified invoices from MSMEs
              </motion.p>
            </motion.div>

            <ActiveInvoicesPreview />

            <motion.div className="text-center mt-10" variants={fadeInUp}>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 font-semibold px-6 py-3 text-sm rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200"
              >
                View All Invoices
                <span>→</span>
              </Link>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 6 — MARKET CONTEXT */}
      <ScrollReveal>
        <section className="py-32 px-6 lg:px-12 border-t border-medium-gray/10 bg-gradient-to-b from-dark-gray/5 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(61,139,104,0.05),transparent_60%)]" />
          <motion.div
            className="max-w-7xl mx-auto relative z-10"
            variants={staggerContainer}
          >
            <motion.div className="text-center mb-16" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-2 mb-4" variants={fadeInUp}>
                <div className="h-px w-6 bg-emerald-400/50" />
                <motion.h2
                  className="text-xs text-emerald-400 tracking-widest uppercase font-medium"
                  variants={fadeIn}
                >
                  The Problem
                </motion.h2>
                <div className="h-px w-6 bg-emerald-400/50" />
              </motion.div>
              <motion.p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" variants={fadeInUp}>
                Market context
              </motion.p>
              <motion.p className="text-base text-gray-400 max-w-2xl mx-auto" variants={fadeInUp}>
                Traditional financing fails small businesses when they need it most
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-emerald-500/20 rounded-2xl p-10 text-center hover:border-emerald-500/50 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.3)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-6xl md:text-7xl lg:text-8xl font-bold font-mono text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300">63M</div>
                  <div className="text-base md:text-lg text-light-gray/90 leading-relaxed font-medium group-hover:text-off-white transition-colors duration-300">MSMEs affected by payment delays</div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-emerald-500/20 rounded-2xl p-10 text-center hover:border-emerald-500/50 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.3)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-6xl md:text-7xl lg:text-8xl font-bold font-mono text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300">45–90d</div>
                  <div className="text-base md:text-lg text-light-gray/90 leading-relaxed font-medium group-hover:text-off-white transition-colors duration-300">typical B2B payment cycle</div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-10 flex items-center justify-center hover:border-emerald-500/60 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.4)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/10 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-xl md:text-2xl text-off-white font-bold text-center leading-relaxed group-hover:text-sage-green-50 transition-colors duration-300">
                    Community financing exists.<br />This formalizes it.
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </ScrollReveal>

      {/* SECTION 7 — FINAL CTA */}
      <ScrollReveal>
        <section className="py-20 px-6 lg:px-12 bg-charcoal border-t border-emerald-500/10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              See it work
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-8 max-w-xl mx-auto">
              Upload an invoice. Watch the protocol enforce settlement. Experience trustless invoice factoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/msme"
                className="bg-emerald-500 text-white font-semibold px-7 py-3 text-sm rounded-lg hover:bg-emerald-400 transition-all duration-200"
              >
                Upload Invoice
              </Link>
              <Link
                href="/browse"
                className="border border-white/[0.12] bg-white/[0.03] text-white font-semibold px-7 py-3 text-sm rounded-lg hover:border-white/[0.2] hover:bg-white/[0.06] transition-all duration-200"
              >
                Browse Demo
              </Link>
            </div>

            <p className="text-xs text-gray-600 mt-6">
              Avalanche Fuji Testnet · No Real Funds
            </p>
          </motion.div>
        </section>
      </ScrollReveal>
    </main>
  );
}

/* Active Invoices Preview Component */
function ActiveInvoicesPreview() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestInvoices() {
      try {
        const data = await getActiveInvoices();
        // Get only the latest 4 invoices
        const latest = data.slice(0, 4);
        setInvoices(latest);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestInvoices();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <InvoiceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg mb-4">No active invoices at the moment</p>
        <Link
          href="/msme"
          className="inline-flex items-center gap-2 bg-emerald-500 text-white font-semibold px-6 py-3 text-sm rounded-lg hover:bg-emerald-400 transition-all duration-200"
        >
          Upload First Invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {invoices.map((invoice, index) => (
        <motion.div
          key={invoice.id || index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <EnhancedInvoiceCard 
            invoice={{
              id: invoice.invoice_nft_id,
              amount: invoice.amount,
              buyer_name: invoice.buyer_name,
              credit_score: invoice.credit_score,
              due_date: invoice.due_date,
              status: invoice.status,
              funded_percentage: invoice.status === 'funded' ? 100 : 0
            }} 
          />
        </motion.div>
      ))}
    </div>
  );
}

/* Scroll Reveal Wrapper */
function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

/* Invariant Item Component - Large and bold */
function InvariantItem({
  title,
  failureMessage,
}: {
  title: string;
  failureMessage: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-emerald-500/20 rounded-2xl p-10 cursor-default group hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden backdrop-blur-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.02, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.25)" }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{
          backgroundPosition: hovered ? ["0% 0%", "100% 100%"] : "0% 0%"
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-8">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-all duration-300 border border-emerald-500/20"
            animate={{
              rotate: hovered ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="text-4xl filter drop-shadow-lg"
              animate={{
                scale: hovered ? 1.2 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              ✓
            </motion.span>
          </motion.div>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-off-white mb-6 tracking-tight leading-tight group-hover:text-sage-green-50 transition-colors duration-300">
          {title}
        </h3>

        {/* Status indicator */}
        <div className="relative h-12 overflow-hidden">
          <motion.div
            className="absolute inset-0 flex items-center gap-3"
            animate={{ opacity: hovered ? 0 : 1, y: hovered ? -20 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-base font-mono text-emerald-400 font-semibold">enforced</span>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center gap-3"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <span className="text-red-400 text-lg">✗</span>
              <span className="text-base font-mono text-red-400 font-semibold">{failureMessage}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* Step Card Component */
function StepCard({
  number,
  text,
  stateLabel,
  isFirst = false,
  isLast = false
}: {
  number: string;
  text: string;
  stateLabel: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-emerald-500/20 rounded-2xl p-8 relative group hover:border-emerald-500/50 transition-all duration-500 backdrop-blur-sm"
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.03, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.3)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-xl transition-all duration-500" />

      <div className="relative z-10">
        {/* Larger number badge */}
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-emerald-500/15 mb-6 group-hover:bg-emerald-500/25 transition-colors duration-300 border border-emerald-500/20"
          animate={{
            scale: hovered ? 1.1 : 1,
            rotate: hovered ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-emerald-400 text-2xl font-bold font-mono">{number}</span>
        </motion.div>

        {/* Larger text */}
        <p className="text-off-white text-xl md:text-2xl font-semibold mt-4 mb-6 leading-tight min-h-[60px] group-hover:text-sage-green-50 transition-colors duration-300">
          {text}
        </p>

        {/* Enhanced state label */}
        <div className="pt-4 border-t border-emerald-500/20">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
            animate={{
              x: hovered ? [0, 4, 0] : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-sm font-mono text-emerald-400 tracking-wider uppercase font-semibold">
              {stateLabel}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Enhanced arrow indicator for flow (except last) */}
      {!isLast && (
        <motion.div
          className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20"
          animate={{
            x: hovered ? [0, 5, 0] : 0
          }}
          transition={{ duration: 1, repeat: hovered ? Infinity : 0 }}
        >
          <div className="w-8 h-8 rounded-full bg-charcoal border-2 border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-500/70 transition-all duration-300 shadow-lg">
            <span className="text-emerald-400/70 text-lg group-hover:text-emerald-400 transition-colors duration-300">→</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* Mac-style Window Component for Interactive Demo */
function MacWindow() {
  const [step, setStep] = useState(1);
  const [currentState, setCurrentState] = useState<"created" | "fundable" | "locked" | "settled">("created");
  const [fundingProgress, setFundingProgress] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [txHash, setTxHash] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    buyer: "",
    dueDate: ""
  });

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [...prev, `${timestamp} ${event}`]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    addEvent("File uploaded: " + file.name);

    setTimeout(() => {
      addEvent("OCR processing started");
    }, 400);

    setTimeout(() => {
      addEvent("Invoice fields extracted");
      setInvoiceData({
        amount: "₹4,50,000",
        buyer: "Tata Motors Ltd.",
        dueDate: "March 15, 2026"
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleConvert = () => {
    addEvent("Creating invoice asset...");
    
    setTimeout(() => {
      addEvent("Asset minted successfully");
      setCurrentState("fundable");
      addEvent("Funding window opened");
      setStep(2);
      
      // Smoother funding animation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setFundingProgress(progress);
        
        if (progress === 50) addEvent("50% funded");
        if (progress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            addEvent("Capital escrowed on-chain");
            setCurrentState("locked");
          }, 300);
        }
      }, 400);
    }, 600);
  };

  const handleWithdrawAttempt = () => {
    addEvent("Withdraw attempt BLOCKED by protocol");
  };

  const handleSettle = () => {
    addEvent("Buyer payment detected");
    setTimeout(() => {
      addEvent("Executing settlement...");
    }, 400);
    setTimeout(() => {
      addEvent("Settlement complete");
      setCurrentState("settled");
      setTxHash("0x7f3a9c2b...8d2c");
      setStep(3);
    }, 1000);
  };

  const states = ["created", "fundable", "locked", "settled"];
  const stateIndex = states.indexOf(currentState);

  return (
    <motion.div 
      className="max-w-5xl mx-auto bg-dark-gray/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(16,185,129,0.15)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Mac Window Controls */}
      <div className="flex items-center gap-2 px-4 py-3 bg-charcoal/95 backdrop-blur-md border-b border-emerald-500/10">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="ml-4 flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="ChaiTrade Logo" 
            className="w-4 h-4 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-sm font-medium">
            <span className="text-gray-300">Chai</span>
            <span className="text-emerald-400">Trade</span>
            <span className="text-gray-400"> Demo</span>
          </span>
        </div>
      </div>

      {/* State Timeline */}
      <div className="px-6 py-4 border-b border-emerald-500/10 bg-charcoal/50 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {states.map((state, idx) => (
            <div key={state} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    idx <= stateIndex ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-600'
                  }`}
                />
                <span 
                  className={`text-xs font-medium capitalize tracking-wide ${
                    idx <= stateIndex ? 'text-emerald-400' : 'text-gray-600'
                  }`}
                >
                  {state}
                </span>
              </div>
              {idx < states.length - 1 && (
                <div className="w-20 md:w-28 h-0.5 mx-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: idx < stateIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex flex-col md:flex-row min-h-[450px]">
        {/* Main Panel */}
        <div className="flex-1 p-6 border-r border-emerald-500/10 bg-charcoal/50 relative">
          
          {/* Tabs */}
          <div className="flex gap-0 mb-6 border-b border-emerald-500/10">
            {[
              { id: 1, label: "Upload" },
              { id: 2, label: "Funding" },
              { id: 3, label: "Settlement" }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => step >= tab.id && setStep(tab.id)}
                disabled={step < tab.id}
                className={`px-5 py-2.5 text-sm font-semibold transition-all duration-300 relative ${
                  step === tab.id 
                    ? 'text-white' 
                    : step > tab.id 
                      ? 'text-emerald-400/80 hover:text-emerald-400' 
                      : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                {tab.label}
                {step === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className="relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload Invoice */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-12 text-center mb-6 cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : uploadedFile 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-gray-600 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-emerald-400 text-base font-medium">Processing invoice...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-emerald-400 text-base font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-400">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-200 text-base mb-2 font-medium">Drop invoice here or click to browse</p>
                      <p className="text-sm text-gray-500">Supports PDF, PNG, JPG</p>
                    </>
                  )}
                </div>

                <AnimatePresence>
                  {invoiceData.amount && (
                    <motion.div 
                      className="bg-charcoal/80 p-5 mb-6 rounded-lg border border-emerald-500/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-sm text-gray-400 font-medium mb-4">Extracted Data</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount</p>
                          <p className="text-white text-base font-semibold">{invoiceData.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Buyer</p>
                          <p className="text-white text-base font-semibold">{invoiceData.buyer}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Due Date</p>
                          <p className="text-white text-base font-semibold">{invoiceData.dueDate}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleConvert}
                  disabled={!invoiceData.amount}
                  className={`w-full font-semibold px-6 py-3.5 text-base rounded-lg transition-all duration-300 ${
                    invoiceData.amount 
                      ? 'bg-emerald-500 text-charcoal hover:bg-emerald-400 shadow-lg shadow-emerald-500/20' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Convert to Fundable Asset
                </button>
              </motion.div>
            )}

            {/* Step 2: Funding State */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-gray-400 font-medium">Funding Progress</p>
                    <p className="text-base text-white font-semibold">{fundingProgress}%</p>
                  </div>
                  <div className="h-2.5 bg-dark-gray/80 overflow-hidden rounded-full border border-emerald-500/20">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${fundingProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-charcoal/60 border border-emerald-500/20">
                  <span className="text-sm text-gray-400 font-medium">Status:</span>
                  <div
                    className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                      currentState === "fundable" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {currentState === "fundable" ? "FUNDABLE" : "LOCKED"}
                  </div>
                </div>

                <div className="flex gap-3 mb-3">
                  <button 
                    onClick={handleWithdrawAttempt}
                    className="flex-1 bg-dark-gray/50 border border-gray-600 text-gray-400 font-medium px-5 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400"
                  >
                    Withdraw funds
                  </button>
                  <button 
                    className="flex-1 bg-dark-gray/50 border border-gray-700 text-gray-500 font-medium px-5 py-3 text-sm rounded-lg cursor-not-allowed opacity-50"
                  >
                    Cancel funding
                  </button>
                </div>
                <p className="text-xs text-red-400/80 font-medium text-center mb-6">
                  Protocol prevents withdrawal - Funds are locked
                </p>

                <AnimatePresence>
                  {currentState === "locked" && (
                    <motion.button 
                      onClick={handleSettle}
                      className="w-full bg-emerald-500 text-charcoal font-semibold px-6 py-3.5 text-base rounded-lg hover:bg-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      Simulate Buyer Payment
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 3: Settlement */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40">
                    SETTLED
                  </div>
                </div>

                <div className="bg-charcoal/60 p-6 rounded-lg border border-emerald-500/20 mb-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Principal Returned</p>
                      <p className="text-white font-bold text-2xl">₹3,60,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Interest Earned</p>
                      <p className="text-emerald-400 font-bold text-2xl flex items-center gap-1">
                        <span>+</span>₹21,600
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-emerald-500/20 pt-5">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Transaction Hash</p>
                    <p className="text-emerald-400 font-mono text-sm bg-charcoal/60 px-4 py-2 rounded-lg border border-emerald-500/20 break-all">
                      {txHash}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  View on Avalanche Explorer
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* System Events Panel */}
        <div className="w-full md:w-72 p-5 bg-gradient-to-br from-charcoal/90 to-dark-gray/60 backdrop-blur-md border-t md:border-t-0 border-l-0 md:border-l border-emerald-500/20 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-sm text-white font-bold tracking-wide uppercase">System Events</h3>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
              <AnimatePresence>
                {events.length === 0 ? (
                  <p className="text-sm text-gray-500 font-medium italic">
                    Waiting for actions...
                  </p>
                ) : (
                  events.map((event, idx) => (
                    <motion.div
                      key={idx}
                      className={`text-xs leading-relaxed p-3 rounded-lg border ${
                        event.includes('blocked') || event.includes('BLOCKED')
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : event.includes('complete') || event.includes('Complete')
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-dark-gray/40 border-gray-700/30 text-gray-300'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="font-mono text-[10px] text-gray-500">{event.split(' ')[0]}</span>
                      <br />
                      <span className="font-medium">{event.substring(event.indexOf(' ') + 1)}</span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
