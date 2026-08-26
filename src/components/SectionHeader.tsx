type SectionHeaderProps = {
  title: string;
  description?: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{description}</p> : null}
    </div>
  );
}
