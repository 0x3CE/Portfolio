import { t } from '@/content/i18n';
import { profile } from '@/content/profile';
import { filled, type Locale } from '@/content/types';

export function Contact({ locale }: { locale: Locale }) {
  const copy = t(locale).contact;
  const email = filled(profile.links.email);
  const github = filled(profile.links.github);
  const linkedin = filled(profile.links.linkedin);

  type ContactLink = { label: string; href: string; text: string };

  // Les libellés viennent d'un dictionnaire `as const` : on élargit avant de filtrer.
  const candidates: (ContactLink | null)[] = [
    email ? { label: copy.email, href: `mailto:${email}`, text: email } : null,
    github ? { label: copy.github, href: github, text: github.replace(/^https?:\/\//, '') } : null,
    linkedin
      ? { label: copy.linkedin, href: linkedin, text: linkedin.replace(/^https?:\/\//, '') }
      : null,
  ];
  const links = candidates.filter((link): link is ContactLink => link !== null);

  return (
    <div>
      <p className="max-w-2xl text-body-lg text-ink/85">{copy.lead}</p>

      {links.length > 0 ? (
        <ul className="mt-8 list-none space-y-4 p-0">
          {links.map((link) => (
            <li key={link.href} className="flex flex-wrap items-baseline gap-x-4">
              <span className="font-pixel text-micro uppercase text-ink/60">{link.label}</span>
              <a
                href={link.href}
                className="break-all font-display text-xl font-semibold text-teal underline underline-offset-4"
              >
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {email ? (
        <a href={`mailto:${email}`} className="btn-bevel mt-8 bg-mustard">
          {copy.email}
        </a>
      ) : null}
    </div>
  );
}
