import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tools } from "@/features/tools/data";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);

  if (!tool) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <Link
        href="/tools"
        className="focus-ring inline-flex items-center gap-2 text-sm font-medium text-(--accent)"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke tools
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              {tool.category ? (
                <Badge variant="outline">{tool.category}</Badge>
              ) : null}
              <CardTitle className="mt-3 text-3xl">{tool.title}</CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                {tool.description}
              </CardDescription>
            </div>
            <Badge variant="outline">/tools/{slug}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {["Screening saham", "Analisa momentum", "Fitur login-ready"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm"
                >
                  {item}
                </div>
              ),
            )}
          </div>
          <Button variant="outline">
            <LockKeyhole className="h-4 w-4" />
            Login untuk menyimpan preset
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
