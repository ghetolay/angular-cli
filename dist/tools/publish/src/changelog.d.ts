/**
 * Just a small command-line wrapper around the conventional-changelog npm module
 * (https://www.npmjs.com/package/conventional-changelog), which also prepends
 * changes to CHANGELOG.md.
 *
 * Appends CHANGELOG.md with the changes between tag and HEAD.
 * NOTE: only `fix`, `feat`, `perf` and `revert` commits are used
 * see:
 * https://github.com/conventional-changelog/conventional-changelog/blob/v0.2.1/presets/angular.js
 */
import { Logger } from '@ngtools/logger';
export default function changelog(args: string[], _opts: any, logger: Logger): void;
