"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconFileInvoice,
  IconUpload,
  IconWallet,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function NavDock() {
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-emerald-400" />
      ),
      href: "/",
    },
    {
      title: "Browse Invoices",
      icon: (
        <IconFileInvoice className="h-full w-full text-emerald-400" />
      ),
      href: "/browse",
    },
    {
      title: "Upload Invoice",
      icon: (
        <IconUpload className="h-full w-full text-emerald-400" />
      ),
      href: "/msme",
    },
    {
      title: "Portfolio",
      icon: (
        <IconWallet className="h-full w-full text-emerald-400" />
      ),
      href: "/portfolio",
    },
    {
      title: "About",
      icon: (
        <IconInfoCircle className="h-full w-full text-emerald-400" />
      ),
      href: "/about",
    },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex items-center justify-center">
      <FloatingDock
        items={links}
        desktopClassName="shadow-lg shadow-emerald-500/10"
        mobileClassName="fixed bottom-6 right-6"
      />
    </div>
  );
}
