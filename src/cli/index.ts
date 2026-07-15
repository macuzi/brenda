#!/usr/bin/env bun
import { Command } from 'commander';
import { runCompare } from './commands/compare';
import { runAsk } from './commands/ask';

const program = new Command().name('brenda').description('Accessibility CLI');

program
  .command('compare')
  .description('Check WCAG contrast for normal text')
  .argument('[foreground]', 'text color hex')
  .argument('[background]', 'surface color hex')
  .action(runCompare);

program
  .command('ask')
  .description('Ask an accessibility question using WCAG/WAI/MDN sources')
  .argument('<question>', 'your accessibility question')
  .action(runAsk);

program.parse();
