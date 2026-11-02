/**
 * Retire /styleguide du build exporté.
 * `INCLUDE_STYLEGUIDE=1 npm run build` la conserve, pour la revue visuelle.
 */
import { rmSync, existsSync } from 'node:fs';

const target = 'out/styleguide';

if (process.env.INCLUDE_STYLEGUIDE === '1') {
  console.log('[strip-styleguide] kept (INCLUDE_STYLEGUIDE=1).');
} else if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
  console.log('[strip-styleguide] removed out/styleguide.');
}
