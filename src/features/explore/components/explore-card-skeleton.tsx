"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreCardSkeleton() {
  return (
    <Card className="group">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_84px] grid-rows-2 gap-x-2 gap-y-2">
          <Skeleton className="h-7 w-24 self-end" />
          <Skeleton className="row-span-2 h-10 w-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
