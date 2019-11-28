# :memo: cxa-track

[![NPM version](https://img.shields.io/npm/v/fcxa-track.svg)](https://www.npmjs.com/package/cxa-track)
[![Build status](https://img.shields.io/travis/sinedied/cxa-track/master.svg)](https://travis-ci.org/sinedied/cxa-track)
![Node version](https://img.shields.io/node/v/cxa-track.svg)
[![Install size](https://packagephobia.now.sh/badge?p=cxa-track)](https://packagephobia.now.sh/result?p=cxa-track)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<img src="https://user-images.githubusercontent.com/593151/69799062-d86c4500-11d2-11ea-8af8-bc9e002ec3d6.png" alt="bit matrix" width="200">

> Convenient CLI to quickly update CxA tracked links

**Features:**
- Watch mode to automagically catch URLs from clipboard and update them without intervention
- Batch mode to search & replace tracked URLs directly in text files
- [Front matter](https://jekyllrb.com/docs/front-matter/) support, using `trackingCode` property if it's defined

## Installation

```sh
npm install -g cxa-track
```

## CLI Usage

```sh
Usage: cxa [options] [<files|URL>]

You can omit the URL argument if you copy one to the clipboard.

Options:
  -s, --set <tracking-code>    Set default tracking code
  -t, --track <tracking-code>  Use specified tracking code
  -w, --watch                  Watch clipboard for URLs
  -h, --help                   Show this help

Tracking code format (fallback to default for missing values):
  event
  event-channel
  event-channel-alias
```

### Default tracking code

You should run `cxa -s event-channel-alias` at least once to save your default tracking code.

You will then be able to override it partially or fully using the `-t` options when needed.

### Watch mode

When using `cxa -w` the app will be left open and monitor your clipboard: each time tracked URLs are detected, they will be updated directly in the clipboard so you can just paste them.

> Note that it not only works with a single URL, but also any text containing multiple URLs 😎

### Batch mode

Using `cxa <files>` you can update tracked links in a bunch of text files at once. Only URLs matching tracked domains will be affected, you can see the list [here]().

Using the `trackingCode` property in a [Front matter](https://jekyllrb.com/docs/front-matter/) section of your files, you can use different tracking code per file (partial overrides are supported, like with `-t` option). This property will always have the priority over the `-t` option.

> Note that text files are read and written using `UTF-8` encoding, be careful if you use other encodings!
