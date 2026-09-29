import readme from '../README.md?raw';

// Every file the README may link to, read as text. Paths are relative to the
// package root, as the README writes them.
const files = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>(
      [
        './**/*.{ts,tsx,css}',
        '../scripts/*.mjs',
        '../.storybook/*.ts',
        '../vite.config.ts',
        '../package.json',
        '../docs/**/*.png',
      ],
      { query: '?raw', import: 'default', eager: true },
    ),
  ).map(([path, text]) => [path.replace(/^\.\.\//, '').replace(/^\.\//, 'src/'), text]),
);

/** `[`src/x.tsx:12`](src/x.tsx#L12 "text on line 12")` */
const lineRefs = [...readme.matchAll(/\[`([^`]+):(\d+)`\]\(([^#)\s]+)#L(\d+)(?: "([^"]*)")?\)/g)].map(
  ([, shownPath, shownLine, path, line, expected]) => ({ shownPath, shownLine, path, line: Number(line), expected }),
);

/** Links to a file in the package without a line: `[`Button.test.tsx`](src/components/Button.test.tsx)`. */
const fileLinks = [...readme.matchAll(/\]\(((?:src|scripts|docs|\.storybook)\/[^#)\s]+)\)/g)].map(([, path]) => path);
const images = [...readme.matchAll(/<img src="([^"]+)"/g)].map(([, path]) => path);

function slug(heading: string) {
  return heading.toLowerCase().replace(/`/g, '').replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
}

describe('README code references', () => {
  it('has references to check', () => {
    expect(lineRefs.length).toBeGreaterThan(20);
  });

  it.each(lineRefs.map((ref) => [`${ref.path}:${ref.line}`, ref] as const))('%s resolves', (_label, ref) => {
    expect(ref.shownPath, 'the link text and the link target name different files').toBe(ref.path);
    expect(Number(ref.shownLine), 'the link text and the link target name different lines').toBe(ref.line);
    expect(files[ref.path], `${ref.path} does not exist`).toBeDefined();

    const lines = files[ref.path].split('\n');
    expect(ref.line, `${ref.path} has only ${lines.length} lines`).toBeLessThanOrEqual(lines.length);
    expect(ref.expected, 'every line reference names the code it points at').toBeTruthy();
    expect(lines[ref.line - 1]).toContain(ref.expected);
  });

  it.each([...fileLinks, ...images])('%s exists', (path) => {
    expect(files[path], `${path} does not exist`).toBeDefined();
  });
});

describe('README contents list', () => {
  it('lists every section and subsection heading, in order', () => {
    const contents = readme.slice(readme.indexOf('## Contents'), readme.indexOf('\n---', readme.indexOf('## Contents')));
    const listed = [...contents.matchAll(/^(?:\d+\.|   -) \[(.+)\]\(#(.+)\)$/gm)].map(([, text, anchor]) => ({ text, anchor }));

    const afterContents = readme.slice(readme.indexOf('## Contents') + '## Contents'.length);
    const headings = [...afterContents.matchAll(/^#{2,3} (.+)$/gm)].map(([, text]) => ({ text, anchor: slug(text) }));

    expect(listed).toEqual(headings);
  });
});
