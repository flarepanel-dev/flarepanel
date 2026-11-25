import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComparePage } from '@/components/compare-page';
import { COMPARISONS } from '@/lib/compare';

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = COMPARISONS.find((c) => c.slug === slug);
  if (!comparison) {
    return {};
  }
  return {
    title: `FlarePanel vs ${comparison.name}: an honest comparison`,
    description: comparison.summary,
    alternates: { canonical: `/compare/${comparison.slug}` },
  };
}

export default async function ComparisonRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = COMPARISONS.find((c) => c.slug === slug);
  if (!comparison) {
    notFound();
  }
  return <ComparePage comparison={comparison} />;
}
