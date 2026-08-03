"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number | null;
}

export function Accordion({ items, defaultOpen = null }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-(--border) transition-all duration-300"
        >
          {/* Header */}
          <button
            onClick={() => toggleAccordion(index)}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-foreground transition-colors duration-200 hover:bg-(--surface-strong)"
          >
            {item.title}
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </button>

          {/* Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 pb-3 text-sm text-muted">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
