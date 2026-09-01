"use client";

import Link from "next/link";
import { Section, StatItem } from "@/features/chart/components/stat-item";
import type { ChartData } from "@/features/chart/types";
import { formatNumber } from "@/features/chart/utils";

export function AboutTab({ data }: { data: ChartData }) {
  const { profile } = data;

  return (
    <div className="space-y-4">
      <Section title="Company Profile">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <StatItem label="Exchange" value={profile.exchangeName ?? "-"} />
          <StatItem label="Quote Type" value={profile.quoteType ?? "-"} />
          <StatItem label="Sector" value={profile.sector ?? "-"} />
          <StatItem label="Industry" value={profile.industry ?? "-"} />
          <StatItem label="Country" value={profile.country ?? "-"} />
          <StatItem label="Phone" value={profile.phone ?? "-"} />
          <StatItem label="Employees" value={formatNumber(profile.employees, 0)} />
          <StatItem label="Headquarters" value={profile.headquarters ?? "-"} />
          {profile.website && (
            <div>
              <p className="text-xs text-muted">Website</p>
              <Link
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-(--accent) transition hover:opacity-80"
              >
                {profile.website}
              </Link>
            </div>
          )}
        </div>
      </Section>

      {profile.longBusinessSummary && (
        <Section title="Company Background">
          <p className="text-sm leading-relaxed text-muted">
            {profile.longBusinessSummary}
          </p>
        </Section>
      )}

      {profile.officers.length > 0 && (
        <Section title="Leadership">
          <div className="space-y-4">
            {profile.officers.map((officer) => (
              <div key={`${officer.name}-${officer.title}`}>
                <p className="font-semibold text-foreground">{officer.name}</p>
                <p className="text-sm text-muted">{officer.title}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
