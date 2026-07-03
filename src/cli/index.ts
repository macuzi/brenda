#!/usr/bin/env bun
import { Command } from 'commander';
import { runCompare } from './commands/compare';

const program = new Command().name('brenda').description('Accessibility CLI');

program
  .command('compare')
  .description('Check WCAG contrast for normal text')
  .argument('[foreground]', 'text color hex')
  .argument('[background]', 'surface color hex')
  .action(runCompare);

program.parse();
