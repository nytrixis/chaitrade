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
      <section className="min-h-screen w-full flex items-center relative overflow-hidden">
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(145, 40%, 55%, .08) 0, hsla(145, 40%, 45%, .02) 50%, hsla(145, 40%, 35%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(145, 40%, 55%, .05) 0, hsla(145, 40%, 45%, .02) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(145, 40%, 55%, .03) 0, hsla(145, 40%, 35%, .01) 80%, transparent 100%)"
        />
        
        <motion.div 
          className="max-w-6xl mx-auto px-6 relative z-10 w-full"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p 
            className="text-sm text-medium-gray mb-4 tracking-wide"
            variants={fadeInUp}
          >
            ChaiTrade
          </motion.p>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-off-white leading-tight max-w-4xl"
            variants={fadeInUp}
          >
            Invoices settle late.<br />Capital shouldn&apos;t.
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-lg text-light-gray max-w-xl"
            variants={fadeInUp}
          >
            Convert unpaid MSME invoices into fundable assets with locked capital and automatic settlement.
          </motion.p>

          <motion.div 
            className="flex gap-4 mt-10 flex-col sm:flex-row"
            variants={fadeInUp}
          >
            <Link 
              href="/msme" 
              className="inline-block bg-sage-green-500 text-charcoal font-medium px-6 py-3 hover:bg-sage-green-600 active:bg-sage-green-700 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-sage-green-500/20 active:translate-y-0 active:shadow-none"
            >
              Upload Invoice
            </Link>
            <Link 
              href="/browse" 
              className="inline-block border border-medium-gray text-off-white font-medium px-6 py-3 hover:border-light-gray hover:bg-medium-gray/10 active:bg-medium-gray/20 transition-all duration-200"
            >
              View Live Demo
            </Link>
          </motion.div>

          <motion.p 
            className="text-sm text-medium-gray mt-6"
            variants={fadeInUp}
          >
            Testnet demo · No real funds
          </motion.p>
        </motion.div>
      </section>

      {/* SECTION 2 — SYSTEM INVARIANTS */}
      <ScrollReveal>
        <section className="py-12 px-6 border-t border-medium-gray/20">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-xs text-medium-gray mb-8 tracking-widest uppercase font-mono"
              variants={fadeIn}
            >
              Four invariants. Every transaction.
            </motion.h2>

            <motion.div 
              className="flex flex-col md:flex-row md:items-start md:divide-x md:divide-medium-gray/30"
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
        <section className="py-16 px-6 border-t border-medium-gray/10">
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              className="text-xs text-medium-gray mb-8 tracking-widest uppercase font-mono"
              variants={fadeIn}
            >
              State machine
            </motion.h2>

            <motion.div 
              className="flex flex-col md:flex-row md:items-stretch"
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
        <section className="py-14 px-6 border-t border-medium-gray/10">
          <div className="max-w-3xl mx-auto">
            <motion.h2 
              className="text-xs text-medium-gray mb-6 tracking-widest uppercase font-mono"
              variants={fadeIn}
            >
              Zero-knowledge verification
            </motion.h2>

            <motion.div 
              className="grid grid-cols-2 gap-px bg-medium-gray/20 overflow-hidden"
              variants={scaleIn}
            >
              <div className="p-5 bg-charcoal">
                <h3 className="text-xs text-medium-gray/70 font-mono tracking-widest uppercase mb-3">Hidden</h3>
                <ul className="space-y-2">
                  <li className="text-medium-gray text-sm">Invoice document</li>
                  <li className="text-medium-gray text-sm">Contract terms</li>
                  <li className="text-medium-gray text-sm">Financial history</li>
                </ul>
              </div>
              <div className="p-5 bg-dark-gray">
                <h3 className="text-xs text-sage-green-500 font-mono tracking-widest uppercase mb-3">Proven</h3>
                <ul className="space-y-2">
                  <li className="text-off-white text-sm flex items-center gap-2">
                    <span className="text-sage-green-500">✓</span>
                    Invoice authenticity
                  </li>
                  <li className="text-off-white text-sm flex items-center gap-2">
                    <span className="text-sage-green-500">✓</span>
                    Amount owed
                  </li>
                  <li className="text-off-white text-sm flex items-center gap-2">
                    <span className="text-sage-green-500">✓</span>
                    Settlement occurred
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* SECTION 6 — MARKET CONTEXT */}
      <ScrollReveal>
        <section className="py-12 px-6 border-t border-medium-gray/10">
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-xs text-medium-gray/60 mb-6 tracking-widest uppercase font-mono"
              variants={fadeIn}
            >
              Context
            </motion.h2>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-12">
              <motion.div className="mb-4 md:mb-0" variants={fadeInUp}>
                <span className="text-2xl font-mono text-light-gray">63M</span>
                <span className="text-xs text-medium-gray ml-2">MSMEs affected by payment delays</span>
              </motion.div>
              <motion.div className="mb-4 md:mb-0" variants={fadeInUp}>
                <span className="text-2xl font-mono text-light-gray">45–90d</span>
                <span className="text-xs text-medium-gray ml-2">typical B2B payment cycle</span>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <span className="text-xs text-medium-gray">Community financing exists. This formalizes it.</span>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </ScrollReveal>

      {/* SECTION 7 — FINAL CTA */}
      <ScrollReveal>
        <section className="py-20 px-6 bg-dark-gray border-t border-sage-green-500/10">
          <motion.div 
            className="max-w-md mx-auto text-center"
            variants={fadeInUp}
          >
            <h2 className="text-lg font-semibold text-off-white mb-2">
              See it work
            </h2>
            <p className="text-sm text-light-gray mb-8">
              Upload an invoice. Watch the protocol enforce settlement.
            </p>
            
            <Link 
              href="/msme" 
              className="inline-block bg-sage-green-500 text-charcoal font-semibold px-12 py-4 hover:bg-sage-green-400 active:bg-sage-green-600 transition-all duration-150"
            >
              Upload Invoice
            </Link>
            
            <p className="text-[10px] text-medium-gray/60 mt-6 font-mono tracking-wide">
              TESTNET ONLY · NO REAL FUNDS
            </p>
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

/* Invariant Item Component - Minimal horizontal style */
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
      className="flex-1 px-6 py-4 first:pl-0 last:pr-0 cursor-default group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={fadeInUp}
    >
      <h3 className="text-sm font-semibold text-off-white mb-2 tracking-tight">
        {title}
      </h3>
      <div className="relative h-4 overflow-hidden">
        <motion.p 
          className="text-xs font-mono text-sage-green-500 absolute inset-0"
          animate={{ opacity: hovered ? 0 : 1, y: hovered ? -10 : 0 }}
          transition={{ duration: 0.15 }}
        >
          enforced
        </motion.p>
        <motion.p 
          className="text-xs font-mono text-red-400 absolute inset-0"
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.15 }}
        >
          {failureMessage}
        </motion.p>
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
  return (
    <motion.div 
      className={`flex-1 px-5 py-4 relative group ${!isLast ? 'md:border-r md:border-medium-gray/20' : ''}`}
      variants={fadeInUp}
    >
      {/* Connector arrow on desktop */}
      {!isLast && (
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
          <span className="text-medium-gray/40 text-lg">→</span>
        </div>
      )}
      <span className="text-sage-green-500/70 text-xs font-mono group-hover:text-sage-green-400 transition-colors duration-200">{number}</span>
      <p className="text-off-white text-sm mt-2 mb-3 leading-snug">
        {text}
      </p>
      <p className="text-[10px] font-mono text-medium-gray group-hover:text-sage-green-400/80 transition-colors duration-200 tracking-wide">
        {stateLabel}
      </p>
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
