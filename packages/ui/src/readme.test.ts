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

function withoutCode(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

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

    // Headings inside fenced code (the Contributing template) are not sections.
    const afterContents = withoutCode(readme.slice(readme.indexOf('## Contents') + '## Contents'.length));
    const headings = [...afterContents.matchAll(/^#{2,3} (.+)$/gm)].map(([, text]) => ({ text, anchor: slug(text) }));

    expect(listed).toEqual(headings);
  });
});

// --- Props tables against the code -----------------------------------------

const componentSources = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>(
      ['./components/*.tsx', '!./components/*.test.tsx', '!./components/*.stories.tsx'],
      { query: '?raw', import: 'default', eager: true },
    ),
  ).map(([path, source]) => [path.replace('./components/', '').replace('.tsx', ''), source]),
);

interface PropRow {
  name: string;
  required: boolean;
  default: string;
}

/** Props as the code declares them: the `<Name>Props` interface, and defaults from the destructuring. */
function propsInCode(name: string, source: string): PropRow[] {
  const body = new RegExp(`export interface ${name}Props \\{([\\s\\S]*?)\\n\\}`).exec(source)?.[1] ?? '';
  const signature = new RegExp(`export function ${name}\\(\\{([\\s\\S]*?)\\}: ${name}Props`).exec(source)?.[1] ?? '';
  const defaults = Object.fromEntries(
    // One prop per line or all on one line: `name = 'literal'` or `name = false`.
    [...signature.matchAll(/(\w+) = ('[^']*'|[^,\s}]+)/g)].map(([, prop, value]) => [prop, value]),
  );
  return [...body.matchAll(/^ {2}'?([\w-]+)'?(\?)?:/gm)].map(([, prop, optional]) => ({
    name: prop,
    required: !optional,
    default: defaults[prop] ?? '—',
  }));
}

/** Props as the README's table for that component lists them. */
function propsInReadme(name: string): PropRow[] | undefined {
  const text = withoutCode(readme);
  const start = text.indexOf(`\n### ${name}\n`);
  if (start === -1) return undefined;
  const section = text.slice(start + 1).split(/\n#{2,3} /)[0];
  const table = section.slice(section.indexOf('#### Props'));
  return table
    .split('\n')
    .filter((line) => /^\| `/.test(line))
    .map((line) => line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim()))
    .map(([prop, , required, fallback]) => ({
      name: prop.replace(/`/g, ''),
      required: required === 'yes',
      default: fallback.replace(/`/g, ''),
    }));
}

describe('README props tables', () => {
  it('finds the components it checks', () => {
    expect(Object.keys(componentSources).length).toBeGreaterThanOrEqual(5);
  });

  it.each(Object.entries(componentSources))('%s is documented, and its table matches its code', (name, source) => {
    const documented = propsInReadme(name);
    expect(documented, `${name} has no "### ${name}" section in the README`).toBeDefined();

    const inCode = propsInCode(name, source);
    expect(inCode.length, `could not read ${name}Props from the source`).toBeGreaterThan(0);
    expect(documented).toEqual(inCode);
  });
});
