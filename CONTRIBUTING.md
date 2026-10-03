# Contributing Guide

Hi! Thanks for your interest to contribute. If you're missing a feature or found a bug, contributions are very welcome.
<br>
Before submitting your contribution, please read through the following guide.

## Repo Setup

To get started just clone the project:

```sh
git clone https://github.com/qwerty084/vue3-chessboard.git
```

Install the required dependencies:
```sh
npm i
```

and start the dev server:
```sh
npm run dev
```

Now you can start developing 🚀

## Creating a Pull Request

After adding your feature/bug fix please run the following npm scripts to format your code and run the linter.

```sh
npm run format
```

and

```sh
npm run lint
```

Then create a branch with a fitting name, commit and push your changes.

## Pinned Vue dev dependencies

`vue`, `@vue/server-renderer` and `@vue/tsconfig` are pinned to exact versions in `devDependencies`. The published type declarations (`dist/src/**/*.d.ts`) are generated against the installed Vue version, and declarations generated with Vue 3.5 only work for projects on Vue 3.5.2 or newer. Building with Vue 3.3.2 keeps them compatible with every Vue version allowed by the `vue` peer dependency. Don't update these packages unless the peer dependency is raised in a new major version. `@vue/server-renderer` must always match the `vue` version exactly.
