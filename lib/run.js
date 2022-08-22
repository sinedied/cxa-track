import process from 'process';
import chalk from 'chalk';

export function safeRun(func, setExitCode = true) {
  try {
    return func() || true;
  } catch (error) {
    console.error(chalk.yellow`Error: ${error.message}`);
    if (setExitCode) process.exitCode = -1;
  }
}
