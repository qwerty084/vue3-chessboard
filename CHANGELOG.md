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
