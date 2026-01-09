"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconBrandTwitter, IconBrandGithub, IconFileText, IconArrowUpRight, IconBrandLinkedin } from "@tabler/icons-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-charcoal to-[#0a0a0a] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500 blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full bg-emerald-500 blur-3xl"></div>
      </div>
      
      {/* Main footer content */}
      <div className="container relative z-10 mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand section */}
          <div className="md:col-span-4 space-y-6">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white">
                Chai<span className="text-emerald-500">Trade</span>
              </h2>
              
            </motion.div>
            
            <p className="text-gray-400 max-w-md leading-relaxed">
              Empowering 63M Indian MSMEs with instant invoice financing. Zero-Knowledge privacy meets community funding on Avalanche blockchain.
            </p>
            
            <div className="pt-2">
              <div className="flex space-x-4">
                {[
                  { icon: <IconBrandTwitter className="h-5 w-5" />, href: "https://twitter.com", label: "Twitter" },
                  { icon: <IconBrandGithub className="h-5 w-5" />, href: "https://github.com", label: "GitHub" },
                  { icon: <IconBrandLinkedin className="h-5 w-5" />, href: "https://linkedin.com", label: "LinkedIn" },
                  { icon: <IconFileText className="h-5 w-5" />, href: "/about", label: "Docs" }
                ].map((social, index) => (
                  <Link 
                    key={index} 
                    href={social.href} 
                    aria-label={social.label}
                    className="bg-dark-gray p-2.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-dark-gray/70 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Platform section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Platform
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Invoices", href: "/browse" },
                { label: "MSME Dashboard", href: "/msme" },
                { label: "My Portfolio", href: "/portfolio" },
                { label: "Marketplace", href: "/marketplace" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center group"
                  >
                    <span>{item.label}</span>
                    <IconArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Resources
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Documentation", href: "/about" },
                { label: "How It Works", href: "/demo" },
                { label: "ZK Privacy", href: "/about#zk-privacy" },
                { label: "Smart Contracts", href: "https://testnet.snowtrace.io" },
                { label: "FAQ", href: "/about#faq" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center group"
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <span>{item.label}</span>
                    <IconArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Legal
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Risk Disclosure", href: "/risk-disclosure" },
                { label: "RBI Compliance", href: "/compliance" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center group"
                  >
                    <span>{item.label}</span>
                    <IconArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Community section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Join Community
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Be part of the revolution empowering MSMEs across India
            </p>
            <div className="space-y-3">
              <Link
                href="/msme"
                className="block px-4 py-2.5 bg-emerald-500 text-charcoal rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20 text-center"
              >
                Get Started
              </Link>
              <Link
                href="/browse"
                className="block px-4 py-2.5 bg-dark-gray text-gray-300 rounded-lg text-sm font-semibold hover:bg-dark-gray/70 hover:text-white transition-all text-center border border-medium-gray/20"
              >
                Explore Invoices
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-16 pt-6 border-t border-medium-gray/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ChaiTrade. Building credit, one invoice at a time.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live on Avalanche Fuji
            </span>
            <span className="text-xs text-gray-500">
              RBI Approved | Aug 2024
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
