# js-4k-template

A simple TypeScript 4kb WebGL intro template?

## Prerequisites

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io)
- [Deno](https://deno.land)
- [Shader Minifier](https://github.com/laurentlb/shader-minifier)
- [Zopfli](https://github.com/google/zopfli)

## Build

```sh
pnpm install
pnpm build
```

## Development

```sh
pnpm install
pnpm dev
```

### Seeking (dev)

These keyboard controls are available in the dev build:

- `Space`: pause / resume
- `←` / `→`: seek by 5s
- `Shift` + `←` / `→`: seek by 60s
- `Alt` + `←` / `→`: seek by one frame
- `Home`: jump to the beginning
- `End`: jump to the end

## License

[CC BY-NC 4.0](./LICENSE)
