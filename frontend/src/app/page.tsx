"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight-new";

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
            className="absolute top-1/4 -left-1/4 w-96 h-96 bg-sage-green-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-sage-green-500/10 rounded-full blur-3xl"
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
            className="inline-flex items-center gap-2 mb-8"
            variants={fadeInUp}
          >
            <div className="h-px w-12 bg-sage-green-500/50" />
            <p className="text-xl text-sage-green-400 tracking-wide font-bold">
              ChaiTrade
            </p>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-off-white leading-[1.1] max-w-5xl mb-8"
            variants={fadeInUp}
          >
            Invoices settle late.
            <br />
            <span className="bg-gradient-to-r from-sage-green-400 to-sage-green-500 bg-clip-text text-transparent">
              Capital shouldn&apos;t.
            </span>
          </motion.h1>

          <motion.p
            className="mt-8 text-xl md:text-2xl text-light-gray/90 max-w-3xl leading-relaxed font-light"
            variants={fadeInUp}
          >
            Convert unpaid MSME invoices into fundable assets with locked capital and automatic settlement.
          </motion.p>

          <motion.div
            className="flex gap-5 mt-12 flex-col sm:flex-row items-start"
            variants={fadeInUp}
          >
            <Link
              href="/msme"
              className="group inline-block bg-sage-green-500 text-charcoal font-bold text-lg px-10 py-5 rounded-xl hover:bg-sage-green-400 active:bg-sage-green-600 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-sage-green-500/30"
            >
              <span className="flex items-center gap-2">
                Upload Invoice
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </Link>
            <Link
              href="/browse"
              className="inline-block border-2 border-sage-green-500/30 text-sage-green-400 font-bold text-lg px-10 py-5 rounded-xl hover:border-sage-green-500/60 hover:bg-sage-green-500/10 active:bg-sage-green-500/20 transition-all duration-200"
            >
              View Live Demo
            </Link>
          </motion.div>

          <motion.div
            className="mt-16 flex items-center gap-8"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sage-green-500 animate-pulse" />
              <p className="text-sm text-medium-gray font-mono uppercase tracking-wider">
                Live on Avalanche Fuji
              </p>
            </div>
            <div className="h-4 w-px bg-medium-gray/30" />
            <p className="text-sm text-medium-gray/60 font-mono">
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
            <motion.div className="text-center mb-20" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-3 mb-6" variants={fadeInUp}>
                <div className="h-px w-8 bg-sage-green-500/50" />
                <p className="text-base text-sage-green-400 tracking-widest uppercase font-bold">
                  Protocol Guarantees
                </p>
                <div className="h-px w-8 bg-sage-green-500/50" />
              </motion.div>
              <motion.h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-off-white mb-6 leading-tight" variants={fadeInUp}>
                Four invariants.
                <br />
                <span className="text-sage-green-400">Every transaction.</span>
              </motion.h2>
              <motion.p className="text-lg md:text-xl text-light-gray/80 max-w-2xl mx-auto" variants={fadeInUp}>
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
        <section className="py-24 px-6 bg-charcoal border-t border-b border-sage-green-500/10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-sage-green-500/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <p className="text-xs text-sage-green-500 font-mono tracking-widest uppercase mb-3">Try it</p>
              <h2 className="text-2xl font-semibold text-off-white">
                Live system demo
              </h2>
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
            <motion.div className="text-center mb-20" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-3 mb-6" variants={fadeInUp}>
                <div className="h-px w-8 bg-sage-green-500/50" />
                <p className="text-base text-sage-green-400 tracking-widest uppercase font-bold">
                  How It Works
                </p>
                <div className="h-px w-8 bg-sage-green-500/50" />
              </motion.div>
              <motion.h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-off-white mb-6 leading-tight" variants={fadeInUp}>
                State machine flow
              </motion.h2>
              <motion.p className="text-lg md:text-xl text-light-gray/80 max-w-3xl mx-auto" variants={fadeInUp}>
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
            <motion.div className="text-center mb-20" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-3 mb-6" variants={fadeInUp}>
                <div className="h-px w-8 bg-sage-green-500/50" />
                <motion.h2
                  className="text-base text-sage-green-400 tracking-widest uppercase font-bold"
                  variants={fadeIn}
                >
                  Privacy First
                </motion.h2>
                <div className="h-px w-8 bg-sage-green-500/50" />
              </motion.div>
              <motion.p className="text-4xl md:text-5xl lg:text-6xl font-bold text-off-white mb-6 leading-tight" variants={fadeInUp}>
                Zero-knowledge verification
              </motion.p>
              <motion.p className="text-lg md:text-xl text-light-gray/80 max-w-3xl mx-auto" variants={fadeInUp}>
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
                className="bg-gradient-to-br from-sage-green-500/10 to-sage-green-500/5 border-2 border-sage-green-500/30 rounded-2xl p-10 relative overflow-hidden group backdrop-blur-sm"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.35)" }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-sage-green-500/15 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-sage-green-500/0 via-sage-green-500/5 to-sage-green-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-sage-green-500/20 flex items-center justify-center border border-sage-green-500/30">
                      <span className="text-3xl text-sage-green-400">✓</span>
                    </div>
                    <h3 className="text-lg text-sage-green-400 font-mono tracking-widest uppercase font-bold">Proven</h3>
                  </div>

                  <ul className="space-y-5">
                    <li className="text-off-white text-lg md:text-xl flex items-center gap-4 group-hover:text-sage-green-50 transition-colors duration-300">
                      <span className="text-sage-green-400 text-2xl font-bold">✓</span>
                      <span className="font-semibold">Invoice authenticity</span>
                    </li>
                    <li className="text-off-white text-lg md:text-xl flex items-center gap-4 group-hover:text-sage-green-50 transition-colors duration-300">
                      <span className="text-sage-green-400 text-2xl font-bold">✓</span>
                      <span className="font-semibold">Amount owed</span>
                    </li>
                    <li className="text-off-white text-lg md:text-xl flex items-center gap-4 group-hover:text-sage-green-50 transition-colors duration-300">
                      <span className="text-sage-green-400 text-2xl font-bold">✓</span>
                      <span className="font-semibold">Settlement occurred</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
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
            <motion.div className="text-center mb-20" variants={fadeIn}>
              <motion.div className="inline-flex items-center gap-3 mb-6" variants={fadeInUp}>
                <div className="h-px w-8 bg-sage-green-500/50" />
                <motion.h2
                  className="text-base text-sage-green-400 tracking-widest uppercase font-bold"
                  variants={fadeIn}
                >
                  The Problem
                </motion.h2>
                <div className="h-px w-8 bg-sage-green-500/50" />
              </motion.div>
              <motion.p className="text-4xl md:text-5xl lg:text-6xl font-bold text-off-white mb-6 leading-tight" variants={fadeInUp}>
                Market context
              </motion.p>
              <motion.p className="text-lg md:text-xl text-light-gray/80 max-w-3xl mx-auto" variants={fadeInUp}>
                Traditional financing fails small businesses when they need it most
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-sage-green-500/20 rounded-2xl p-10 text-center hover:border-sage-green-500/50 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.3)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sage-green-500/0 to-sage-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-6xl md:text-7xl lg:text-8xl font-bold font-mono text-sage-green-400 mb-5 group-hover:scale-110 transition-transform duration-300">63M</div>
                  <div className="text-base md:text-lg text-light-gray/90 leading-relaxed font-medium group-hover:text-off-white transition-colors duration-300">MSMEs affected by payment delays</div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-sage-green-500/20 rounded-2xl p-10 text-center hover:border-sage-green-500/50 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.3)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sage-green-500/0 to-sage-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-6xl md:text-7xl lg:text-8xl font-bold font-mono text-sage-green-400 mb-5 group-hover:scale-110 transition-transform duration-300">45–90d</div>
                  <div className="text-base md:text-lg text-light-gray/90 leading-relaxed font-medium group-hover:text-off-white transition-colors duration-300">typical B2B payment cycle</div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-sage-green-500/10 to-sage-green-500/5 border-2 border-sage-green-500/30 rounded-2xl p-10 flex items-center justify-center hover:border-sage-green-500/60 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.4)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sage-green-500/0 via-sage-green-500/10 to-sage-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
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
        <section className="py-40 px-6 lg:px-12 bg-gradient-to-b from-dark-gray/50 via-charcoal to-charcoal border-t border-sage-green-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,139,104,0.12),transparent_60%)]" />
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage-green-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sage-green-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.div
            className="max-w-4xl mx-auto text-center relative z-10"
            variants={fadeInUp}
          >
            <motion.div
              className="inline-block mb-10"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sage-green-500/20 to-sage-green-500/10 border-2 border-sage-green-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-sage-green-500/20">
                <span className="text-5xl">⚡</span>
              </div>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-off-white mb-8 leading-tight"
              variants={fadeInUp}
            >
              See it work
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl text-light-gray/90 mb-16 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Upload an invoice. Watch the protocol enforce settlement. Experience trustless invoice factoring.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={fadeInUp}
            >
              <Link
                href="/msme"
                className="group relative inline-block"
              >
                <div className="absolute inset-0 bg-sage-green-500 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative bg-sage-green-500 text-charcoal font-bold px-12 py-5 text-lg rounded-xl hover:bg-sage-green-400 active:bg-sage-green-600 transition-all duration-200 hover:scale-105 shadow-2xl shadow-sage-green-500/30">
                  Upload Invoice
                </div>
              </Link>
              <Link
                href="/browse"
                className="inline-block border-2 border-sage-green-500/40 text-sage-green-400 font-bold px-12 py-5 text-lg rounded-xl hover:border-sage-green-500/70 hover:bg-sage-green-500/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                Browse Demo
              </Link>
            </motion.div>

            <motion.p
              className="text-sm text-medium-gray/70 mt-14 font-mono tracking-widest uppercase"
              variants={fadeInUp}
            >
              Avalanche Fuji Testnet · No Real Funds
            </motion.p>
          </motion.div>
        </section>
      </ScrollReveal>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-medium-gray/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              {["Home", "Browse", "Portfolio", "About"].map((item) => (
                <Link 
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`} 
                  className="text-medium-gray/60 hover:text-off-white transition-colors duration-150 text-xs"
                >
                  {item}
                </Link>
              ))}
              <a 
                href="https://github.com/nytrixis/chaitrade" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-medium-gray/60 hover:text-off-white transition-colors duration-150 text-xs"
              >
                GitHub
              </a>
            </div>
            
            <p className="text-medium-gray/40 text-[10px] font-mono">
              Avalanche Fuji Testnet
            </p>
          </div>
        </div>
      </footer>
    </main>
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
      className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-sage-green-500/20 rounded-2xl p-10 cursor-default group hover:border-sage-green-500/50 transition-all duration-500 relative overflow-hidden backdrop-blur-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.02, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.25)" }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-sage-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{
          backgroundPosition: hovered ? ["0% 0%", "100% 100%"] : "0% 0%"
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-sage-green-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-8">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-sage-green-500/15 flex items-center justify-center group-hover:bg-sage-green-500/25 transition-all duration-300 border border-sage-green-500/20"
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
            <div className="flex items-center gap-2 px-4 py-2 bg-sage-green-500/10 rounded-lg border border-sage-green-500/20">
              <span className="text-sage-green-400 text-lg">✓</span>
              <span className="text-base font-mono text-sage-green-400 font-semibold">enforced</span>
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
      className="bg-gradient-to-br from-dark-gray/60 to-dark-gray/30 border-2 border-sage-green-500/20 rounded-2xl p-8 relative group hover:border-sage-green-500/50 transition-all duration-500 backdrop-blur-sm"
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.03, boxShadow: "0 30px 60px -15px rgba(61, 139, 104, 0.3)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-green-500/0 via-sage-green-500/5 to-sage-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-sage-green-500/0 group-hover:bg-sage-green-500/5 blur-xl transition-all duration-500" />

      <div className="relative z-10">
        {/* Larger number badge */}
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-sage-green-500/15 mb-6 group-hover:bg-sage-green-500/25 transition-colors duration-300 border border-sage-green-500/20"
          animate={{
            scale: hovered ? 1.1 : 1,
            rotate: hovered ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-sage-green-400 text-2xl font-bold font-mono">{number}</span>
        </motion.div>

        {/* Larger text */}
        <p className="text-off-white text-xl md:text-2xl font-semibold mt-4 mb-6 leading-tight min-h-[60px] group-hover:text-sage-green-50 transition-colors duration-300">
          {text}
        </p>

        {/* Enhanced state label */}
        <div className="pt-4 border-t border-sage-green-500/20">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-2 bg-sage-green-500/10 rounded-lg border border-sage-green-500/20"
            animate={{
              x: hovered ? [0, 4, 0] : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-2 h-2 rounded-full bg-sage-green-400 animate-pulse" />
            <p className="text-sm font-mono text-sage-green-400 tracking-wider uppercase font-semibold">
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
          <div className="w-8 h-8 rounded-full bg-charcoal border-2 border-sage-green-500/30 flex items-center justify-center group-hover:border-sage-green-500/70 transition-all duration-300 shadow-lg">
            <span className="text-sage-green-400/70 text-lg group-hover:text-sage-green-400 transition-colors duration-300">→</span>
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

    // Simulate OCR processing
    setTimeout(() => {
      addEvent("OCR processing started");
    }, 300);

    setTimeout(() => {
      addEvent("Invoice fields extracted");
      // Simulate extracted data
      setInvoiceData({
        amount: "₹4,50,000",
        buyer: "Tata Motors Ltd.",
        dueDate: "March 15, 2026"
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleConvert = () => {
    addEvent("Invoice asset created");
    setCurrentState("fundable");
    addEvent("Funding window opened");
    setStep(2);
    
    // Simulate funding
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setFundingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        addEvent("Capital escrowed");
        setCurrentState("locked");
      }
    }, 500);
  };

  const handleWithdrawAttempt = () => {
    addEvent("Withdraw attempt blocked");
  };

  const handleSettle = () => {
    addEvent("Buyer payment detected");
    setTimeout(() => {
      addEvent("Settlement executed");
      setCurrentState("settled");
      setTxHash("0x7f3a9c2b...8d2c");
      setStep(3);
    }, 500);
  };

  const states = ["created", "fundable", "locked", "settled"];
  const stateIndex = states.indexOf(currentState);

  return (
    <motion.div 
      className="bg-dark-gray border border-medium-gray/40 rounded-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mac Window Controls */}
      <div className="flex items-center gap-2 px-5 py-4 bg-charcoal border-b border-medium-gray/30">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer"></div>
        <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all cursor-pointer"></div>
        <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all cursor-pointer"></div>
        <span className="ml-4 text-xs text-medium-gray/60 font-mono">ChaiTrade Demo</span>
      </div>

      {/* State Timeline */}
      <div className="px-6 py-4 border-b border-medium-gray/30 bg-charcoal">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {states.map((state, idx) => (
            <div key={state} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    idx <= stateIndex ? 'bg-sage-green-500' : 'bg-medium-gray/40'
                  }`}
                  animate={{ 
                    scale: idx === stateIndex ? [1, 1.3, 1] : 1,
                    boxShadow: idx === stateIndex ? "0 0 10px rgba(61, 139, 104, 0.5)" : "none"
                  }}
                  transition={{ duration: 0.5, repeat: idx === stateIndex ? Infinity : 0, repeatDelay: 1 }}
                />
                <span className={`text-xs mt-1.5 font-mono capitalize transition-colors duration-300 ${
                  idx <= stateIndex ? 'text-sage-green-400' : 'text-medium-gray/50'
                }`}>
                  {state}
                </span>
              </div>
              {idx < states.length - 1 && (
                <motion.div 
                  className="w-16 md:w-24 h-px mx-2 bg-medium-gray/30 overflow-hidden"
                >
                  <motion.div 
                    className="h-full bg-sage-green-500"
                    initial={{ width: "0%" }}
                    animate={{ width: idx < stateIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex flex-col md:flex-row">
        {/* Main Panel */}
        <div className="flex-1 p-6 border-r border-medium-gray/20">
          {/* Tabs */}
          <div className="flex gap-0 mb-6 border-b border-medium-gray/20">
            {[
              { id: 1, label: "01_upload" },
              { id: 2, label: "02_funding" },
              { id: 3, label: "03_settle" }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => step >= tab.id && setStep(tab.id)}
                disabled={step < tab.id}
                className={`px-4 py-2.5 text-xs font-mono transition-all duration-200 relative ${
                  step === tab.id 
                    ? 'text-off-white' 
                    : step > tab.id 
                      ? 'text-sage-green-400/60 hover:text-sage-green-400' 
                      : 'text-medium-gray/50 cursor-not-allowed'
                }`}
              >
                {tab.label}
                {step === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-px bg-sage-green-500"
                    layoutId="activeTab"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Upload Invoice */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                
                <motion.div 
                  className={`border-2 border-dashed p-8 text-center mb-4 cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-sage-green-500 bg-sage-green-500/5' 
                      : uploadedFile 
                        ? 'border-sage-green-500/50 bg-sage-green-500/5' 
                        : 'border-medium-gray/40 hover:border-medium-gray/60'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <motion.div 
                        className="w-6 h-6 border-2 border-sage-green-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-sage-green-400 text-sm font-mono">Processing...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-sage-green-400 text-sm">{uploadedFile.name}</p>
                      <p className="text-xs text-medium-gray">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-medium-gray text-sm mb-1">Drag and drop invoice here</p>
                      <p className="text-xs text-medium-gray/60 font-mono">PDF, PNG, or JPG</p>
                    </>
                  )}
                </motion.div>

                <AnimatePresence>
                  {invoiceData.amount && (
                    <motion.div 
                      className="bg-dark-gray p-4 mb-4 border border-medium-gray/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-xs text-medium-gray font-mono mb-3">Parsed fields</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-medium-gray">Amount</p>
                          <motion.p 
                            className="text-off-white text-sm font-mono"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            {invoiceData.amount}
                          </motion.p>
                        </div>
                        <div>
                          <p className="text-xs text-medium-gray">Buyer</p>
                          <motion.p 
                            className="text-off-white text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {invoiceData.buyer}
                          </motion.p>
                        </div>
                        <div>
                          <p className="text-xs text-medium-gray">Due</p>
                          <motion.p 
                            className="text-off-white text-sm font-mono"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {invoiceData.dueDate}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  onClick={handleConvert}
                  disabled={!invoiceData.amount}
                  className={`w-full font-medium px-4 py-3 text-sm transition-all duration-200 ${
                    invoiceData.amount 
                      ? 'bg-sage-green-500 text-charcoal hover:bg-sage-green-600 active:bg-sage-green-700' 
                      : 'bg-medium-gray/20 text-medium-gray cursor-not-allowed'
                  }`}
                  whileHover={invoiceData.amount ? { scale: 1.01 } : {}}
                  whileTap={invoiceData.amount ? { scale: 0.99 } : {}}
                >
                  Convert to fundable asset
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Funding State */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-medium-gray font-mono">Funding progress</p>
                    <p className="text-xs text-off-white font-mono">{fundingProgress}%</p>
                  </div>
                  <div className="h-1.5 bg-dark-gray overflow-hidden rounded-full">
                    <motion.div 
                      className="h-full bg-sage-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${fundingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs text-medium-gray font-mono">Status:</span>
                  <motion.span 
                    className={`px-2 py-0.5 text-xs font-mono ${
                      currentState === "fundable" 
                        ? "bg-sage-green-500/20 text-sage-green-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                    key={currentState}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentState === "fundable" ? "FUNDABLE" : "LOCKED"}
                  </motion.span>
                </div>

                <div className="flex gap-2 mb-2">
                  <motion.button 
                    onClick={handleWithdrawAttempt}
                    className="flex-1 bg-medium-gray/10 border border-medium-gray/30 text-medium-gray font-medium px-4 py-2.5 text-xs transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Withdraw funds
                  </motion.button>
                  <button 
                    className="flex-1 bg-medium-gray/10 border border-medium-gray/30 text-medium-gray font-medium px-4 py-2.5 text-xs cursor-not-allowed opacity-60"
                  >
                    Cancel funding
                  </button>
                </div>
                <p className="text-xs text-red-400/60 font-mono text-center mb-5">Blocked by protocol</p>

                <AnimatePresence>
                  {currentState === "locked" && (
                    <motion.button 
                      onClick={handleSettle}
                      className="w-full bg-sage-green-500 text-charcoal font-medium px-4 py-3 text-sm hover:bg-sage-green-600 active:bg-sage-green-700 transition-all duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Trigger buyer payment
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 3: Settlement */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-5">
                  <motion.span 
                    className="inline-block px-4 py-1.5 text-sm font-mono bg-sage-green-500/20 text-sage-green-400"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    SETTLED
                  </motion.span>
                </div>

                <motion.div 
                  className="bg-dark-gray p-5 border border-sage-green-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid grid-cols-2 gap-6 mb-5">
                    <div>
                      <p className="text-xs text-medium-gray mb-1">Principal returned</p>
                      <p className="text-off-white font-mono text-lg">₹3,60,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-medium-gray mb-1">Interest distributed</p>
                      <p className="text-sage-green-400 font-mono text-lg">+ ₹21,600</p>
                    </div>
                  </div>
                  <div className="border-t border-medium-gray/20 pt-4">
                    <p className="text-xs text-medium-gray mb-1">Transaction hash</p>
                    <p className="text-off-white font-mono text-sm">{txHash}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Events Panel */}
        <div className="w-full md:w-56 p-4 bg-dark-gray/60 border-t md:border-t-0 border-medium-gray/20">
          <h3 className="text-xs text-medium-gray font-mono tracking-widest uppercase mb-4">System Events</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {events.length === 0 ? (
                <p className="text-xs text-medium-gray/40 font-mono">Waiting for actions...</p>
              ) : (
                events.map((event, idx) => (
                  <motion.p 
                    key={idx} 
                    className="text-xs font-mono leading-relaxed"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-medium-gray/60">{event.split(' ')[0]}</span>{' '}
                    <span className={
                      event.includes('blocked') 
                        ? 'text-red-400/80' 
                        : event.includes('executed') || event.includes('escrowed') || event.includes('extracted')
                          ? 'text-sage-green-400' 
                          : 'text-light-gray'
                    }>
                      {event.split(' ').slice(1).join(' ')}
                    </span>
                  </motion.p>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
