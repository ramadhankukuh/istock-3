"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type StockSummaryBoardItem = {
  stockCode: string;
  stockName: string;
  value: number;
  valueLabel: string;
  secondaryLabel?: string;
  valueClassName?: string;
};

function StockLogo({
  stockCode,
  stockName,
}: {
  stockCode: string;
  stockName: string;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const initials =
    stockCode.slice(0, 2).toUpperCase() || stockName.slice(0, 2).toUpperCase();

  if (logoFailed || !stockCode) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-[10px] font-semibold tracking-[0.08em] text-muted">
        {initials}
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
      <Image
        src={`https://ik.imagekit.io/kuh/istock/company/${stockCode}.png?tr=f-auto`}
        alt={`${stockName} logo`}
        width={32}
        height={32}
        className="h-full w-full rounded-full object-contain"
        loading="lazy"
        unoptimized
        onError={() => setLogoFailed(true)}
      />
    </div>
  );
}

export default function StockSummaryBoard({
  title,
  items,
  variant = "card",
}: {
  title: string;
  items: StockSummaryBoardItem[];
  variant?: "card" | "bordered" | "plain";
}) {
  const boardContent = (
    <>
      <div className="p-0">
        {items.length > 0 ? (
          <div className="divide-y divide-(--border)">
            {items.map((item, index) => (
              <div
                key={`${title}-${item.stockCode}-${index}`}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StockLogo
                    stockCode={item.stockCode}
                    stockName={item.stockName}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.stockCode}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {item.stockName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "whitespace-nowrap text-sm font-semibold sm:text-base",
                      item.valueClassName ?? "text-foreground",
                    )}
                  >
                    {item.valueLabel}
                  </p>
                  {item.secondaryLabel ? (
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                      {item.secondaryLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted">Belum ada data.</p>
          </div>
        )}
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-0">
          <p className="text-sm font-semibold">{title}</p>
        </CardHeader>
        <CardContent className="p-0">{boardContent}</CardContent>
      </Card>
    );
  }

  if (variant === "bordered") {
    return (
      <div className="overflow-hidden rounded-2xl border border-(--border)">
        <p className="px-4 pt-3.5 text-sm font-semibold text-foreground">
          {title}
        </p>
        {boardContent}
      </div>
    );
  }

  return <div>{boardContent}</div>;
}
