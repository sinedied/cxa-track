#!/usr/bin/env node

import process from 'process';
import { cli } from '../lib/cli.js';

cli(process.argv.slice(2));
