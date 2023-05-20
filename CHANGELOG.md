## 1.1.7 (2023-05-20)

### Features

- multiplayer support through setting the player color as a prop to the board component ([841dfac](https://github.com/qwerty084/vue3-chessboard/commit/841dfacc5dd5ab96b216da1b0327d36dd17a1d1d)) @[ddbogdanov](https://github.com/ddbogdanov)

## 1.1.6 (2023-05-13)

### Bug fixes

- export types correctly ([ee1e400](https://github.com/qwerty084/vue3-chessboard/commit/ee1e4009a6149360e686f07d26ab9ad7730b67fe))
- fix board config merge ([8d4c24b](https://github.com/qwerty084/vue3-chessboard/commit/8d4c24b7d4f0ec841b49bc57a598ecc94dd777a7))

## 1.1.5 (2023-03-25)

- update all dependencies

## 1.1.4 (2023-03-25)

### Bug Fixes

- emit check event on pgn load when in check ([1c9cebf](https://github.com/qwerty084/vue3-chessboard/pull/152/commits/1c9cebf6b3e52375b9d95610a9f3ec9d08e5aeed))

### Features

- improve promotion animation ([c22b6a3](https://github.com/qwerty084/vue3-chessboard/pull/151/commits/c22b6a300b54358fae05bad7a5d5bbab06050034))
- added new turn number method ([ce6fdce](https://github.com/qwerty084/vue3-chessboard/pull/155/commits/ce6fdce26c3e4dadb46b5e8fbc20eea25e91ab6b))

## 1.1.3 (2023-02-25)

- remove event data from draw and stalemate events
- update foreach to for of loop
- improve coordinates

## 1.1.2 (2023-02-19)

### Breaking

- if you are using TypeScript you need to change the type import "ChessboardAPI" to "BoardApi" ([fbcd3c9](https://github.com/qwerty084/vue3-chessboard/commit/732ec72c3ced28e6e767ef42318651142d197418))

### Bug Fixes

- export all available types from the library ([b4d1315](https://github.com/qwerty084/vue3-chessboard/commit/b4d131586ab9b86b2fe919e346149adf309e6109))

### Other

- reduced bundle size ([787c87e](https://github.com/qwerty084/vue3-chessboard/commit/787c87ede6a9155d2e3c5911af32ebe7c93d8886))

<br>
<hr>
<br>

## 1.1.1 (2023-02-18)

### Bug Fixes

- fix setPosition() and loadPgn() in boardApi ([2137d1d](https://github.com/qwerty084/vue3-chessboard/commit/2137d1d4c259f986297b650ebc439f2399480ff5)) @[mateusocb](https://github.com/mateusocb)

<br>
<hr>
<br>

## 1.1.0 (2023-02-17)

### Features

- added new move event ([41bff37](https://github.com/qwerty084/vue3-chessboard/commit/41bff37c85a911cfc4ead2cf514253fa8c8075ab))

### Bug Fixes

- fixed bug in inital fen ([b272ec7](https://github.com/qwerty084/vue3-chessboard/commit/b272ec7eb0903d242f8d28e581d611442b6ea10f))

### Other

- dependency version updates

<br>
<hr>
<br>

## 1.0.0 (2023-02-05)

### v1.0.0. includes some breaking changes. Only breaking changes will be listed here. Refer to the new documentation to update your app to v1.0.0

- callback functions as props have been removed. Take a look at the [documentation](https://qwerty084.github.io/vue3-chessboard/callbacks.html) to see how to register callbacks in v1.0.0.
- board and game from the boardAPI have been made private. You need to use the corresponding method to achieve the same result. Visit the [docs](https://qwerty084.github.io/vue3-chessboard/board-api.html) to get an overview of all available methods.
- If you encounter any issues visit the [docs](https://qwerty084.github.io/vue3-chessboard/) or open an [issue](https://github.com/qwerty084/vue3-chessboard/issues/new/choose).

## 0.0.9 (2022-11-13)

### Bug Fixes

- **board:** fix coordinates when board orientation is toggled ([85ec6d5](https://github.com/qwerty084/vue3-chessboard/commit/85ec6d563f1803af5a135ab0066fb240cd729535))
- **board:** remove duplicate styles ([85ec6d5](https://github.com/qwerty084/vue3-chessboard/commit/85ec6d563f1803af5a135ab0066fb240cd729535))

### Dev

- implement new tsconfig structure & update testing suite/ci ([6a4c2be](https://github.com/qwerty084/vue3-chessboard/commit/6a4c2bed7ef723dbe514f6534596fbba2caa76ae))
- add html and App.vue for local testing ([34fb7f0](https://github.com/qwerty084/vue3-chessboard/commit/34fb7f039131e48aa8c93b5064897bfb80163d09))

<br>
<hr>
<br>

## 0.0.8 (2022-10-26)

### Bug Fixes

- **board:** load promotion dialog synchronously ([374ed67](https://github.com/qwerty084/vue3-chessboard/commit/374ed674b44ab651a13cdddf02b177b13ea7cb11))
- **boardAPI:** fix undo method ([40bb425](https://github.com/qwerty084/vue3-chessboard/commit/40bb425e86bcbb9720552343824eab451e7d26f6))

<br>
<hr>
<br>

## 0.0.7 (2022-10-24)

### Bug Fixes

- **board:** fix undo while promoting ([90c36de](https://github.com/qwerty084/vue3-chessboard/commit/90c36deb8b2c280f8cdc562a23ee4399deccfacd))
- **board:** fix reselect of pieces ([9dde375](https://github.com/qwerty084/vue3-chessboard/commit/9dde375188d8700ce62882e2396dd934d68fe5da))
- **board:** fix undo not being animated ([09c888c](https://github.com/qwerty084/vue3-chessboard/commit/09c888cadfebd9293cb84c2150ed21b7f136be18))

### Features

- **board:** add callback functions for piece select and after move as props to board component ([d6dc946](https://github.com/qwerty084/vue3-chessboard/commit/d6dc9464463de2f1c4f850bb508df0f3a69f3c04))
- **boardAPI:** add method getOpeningName() to retrieve opening name for the current position from lichess api ([d8457c5](https://github.com/qwerty084/vue3-chessboard/commit/d8457c503a22653628ef58a36e8f642464979ebe))
- **boardAPI:** add method getOpeningDescription() to retrieve opening description for the current position from wikibooks.org api ([d8457c5](https://github.com/qwerty084/vue3-chessboard/commit/bb58b4b2fdb8b99f805bc506cfe3ec53dbdedd8f))
- **boardAPI:** add makeMove() method to make a move programmatically on the board ([8215b15](https://github.com/qwerty084/vue3-chessboard/commit/8215b152b11219e8764f4473959f5dd742f81123)), closes [#18](https://github.com/qwerty084/vue3-chessboard/issues/18)

### Dev

- setup vitest and added some tests
- setup github actions for pull requests (runs type check, build, eslint and tests)
- code base cleaned up

### IMPORTANT CHANGES

- pinia is no longer required, it wasn't used extensivly and added unnecessary bloat ([9a177c2](https://github.com/qwerty084/vue3-chessboard/commit/9a177c2c46cfe179dac3e426bd96961ba5f4d87a))
<br>
<hr>
<br>

## 0.0.6 (2022-10-18)

### Bug Fixes

- **boardAPI:** reset selected square when resetBoard() is being called ([d8457c5](https://github.com/qwerty084/vue3-chessboard/commit/85f21efe41a12cf22b01dc5b45a7efab10a4a77d))
- **board:** fix coordinates when board orientation is toggled ([d8457c5](https://github.com/qwerty084/vue3-chessboard/commit/85f21efe41a12cf22b01dc5b45a7efab10a4a77d))

### Features

- **boardAPI:** added method to get the opening name for the current position from the lichess public api ([d8457c5](https://github.com/qwerty084/vue3-chessboard/commit/d8457c503a22653628ef58a36e8f642464979ebe))
- **board:** added lichess svgs for pieces ([266ebbe](https://github.com/qwerty084/vue3-chessboard/commit/266ebbe6693693d7be770e12fd6009a6326fd38b))
