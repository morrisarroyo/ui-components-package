/** A link in the row of pills under a docs page's introduction. */
export interface DocLink {
  label: string;
  href: string;
  /** A short symbol shown before the label. */
  icon?: string;
}

/**
 * The row of pill links under a docs page's introduction, after Material UI's
 * component pages. A link that starts with "?path=" opens another docs page;
 * it targets the whole Storybook window, since docs render in a frame.
 */
export function DocLinks({ links }: { links: DocLink[] }) {
  return (
    <div className="doc-links">
      {links.map((link) => {
        const internal = link.href.startsWith('?path=') || link.href.startsWith('#');
        return (
          <a
            key={link.label}
            href={link.href.startsWith('?path=') ? `./${link.href}` : link.href}
            target={link.href.startsWith('#') ? undefined : internal ? '_top' : '_blank'}
            rel={internal ? undefined : 'noreferrer'}
          >
            {link.icon ? <span aria-hidden="true">{link.icon}</span> : null}
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
