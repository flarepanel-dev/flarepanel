import { formatPostDate } from '@/lib/blog';

export function PostMetaLine({
  date,
  tags,
}: {
  date: string;
  tags: readonly string[];
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-faint uppercase tracking-[0.08em]">
      <time dateTime={date}>{formatPostDate(date)}</time>
      {tags.map((tag) => (
        <span className="text-soft" key={tag}>
          · {tag}
        </span>
      ))}
    </p>
  );
}
