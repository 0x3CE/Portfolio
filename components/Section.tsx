import { SectionRule } from '@/components/SectionRule';

type Props = {
  id: string;
  title: string;
  lead?: string;
  rule?: 'wave' | 'dots';
  children: React.ReactNode;
};

export function Section({ id, title, lead, rule = 'wave', children }: Props) {
  return (
    <section id={id} className="scroll-mt-8 py-16 sm:py-24">
      <div className="shell">
        <h2 className="text-section font-bold text-teak">{title}</h2>
        <SectionRule variant={rule} color="#8C4A26" className="mt-3 max-w-md" />
        {lead ? <p className="mt-5 max-w-2xl text-body-lg text-ink/80">{lead}</p> : null}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}
