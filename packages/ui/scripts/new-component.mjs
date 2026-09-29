/**
 * Scaffolds a new ui component: the four co-located files every component
 * has, and its export from the single entry point.
 *
 *   npm run new-component --workspace ui -- Badge
 *
 * The generated component already passes typecheck, its own test, the story
 * test and the entry-point test, so the next step is changing it, not wiring it.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const componentsDir = join(src, 'components');
const name = process.argv[2];

function fail(message) {
  console.error(`new-component: ${message}`);
  process.exit(1);
}

if (!name) fail('give the component a name, e.g. `npm run new-component --workspace ui -- Badge`');
if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) fail(`"${name}" is not PascalCase (e.g. Badge, StatusPill)`);
if (existsSync(join(componentsDir, `${name}.tsx`))) fail(`${name} already exists in src/components`);

const files = {
  [`${name}.tsx`]: `import type { ReactNode } from 'react';
import styles from './${name}.module.css';

export interface ${name}Props {
  /** The content shown inside the ${name}. */
  children: ReactNode;
}

export function ${name}({ children }: ${name}Props) {
  return <div className={styles.root}>{children}</div>;
}
`,
  [`${name}.module.css`]: `/* Every value comes from tokens.css; never hard-code a colour, size or spacing. */
.root {
  font-family: var(--ui-font-family);
  font-size: var(--ui-font-body-size);
  line-height: var(--ui-font-body-line);
  color: var(--ui-color-text);
}
`,
  [`${name}.test.tsx`]: `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders its children', () => {
    render(<${name}>Hello</${name}>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
`,
  [`${name}.stories.tsx`]: `import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${name} } from './${name}';

const meta = {
  title: 'Components/${name}',
  component: ${name},
  args: { children: '${name} content' },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`,
};

for (const [file, content] of Object.entries(files)) {
  writeFileSync(join(componentsDir, file), content);
  console.log(`created src/components/${file}`);
}

const indexPath = join(src, 'index.ts');
const index = readFileSync(indexPath, 'utf8').trimEnd();
writeFileSync(
  indexPath,
  `${index}\n\nexport { ${name} } from './components/${name}';\nexport type { ${name}Props } from './components/${name}';\n`,
);
console.log('added the export to src/index.ts');
console.log(`\nNext: make it your component, then add a "### ${name}" section to README.md.`);
console.log('npm test fails, naming it, until that section and its props table exist.');
