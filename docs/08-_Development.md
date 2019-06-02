# Development

1. Make a local clone of this repo: `git clone git@github.com:Palindrom/Palindrom.git`
2. Go to the directory: `cd Palindrom`
3. Install the local dependencies: `npm install`
4. Start the development server: `npm run serve`
5. Bundle by calling `npm run build` in your shell, or `npm run build-watch` to automatically rebuild after every file change
6. Open the test suite: [http://localhost:5000/test/MochaSpecRunner.html](http://localhost:5000/test/MochaSpecRunner.html)

#### Updating documentation

Everything in `docs` folder is automatically fetched by the website and each MD file is considered a documentation section. Sections are sorted alphabetically; it's recommended to prefix your file with a numeric ordering index. Eg. (`01-installation.md`, `02-development.md`..etc).

### Releases

To release new version run

```sh
npm version <patch|minor|major> # to replace version in files and tag the repo
git push && git push --tags
...
npm publish

```

### Testing

You can test Palindrom using three methods depending on your need (what you've modified):

1. **CLI testing:** it is perfect for testing Palindrom only (as opposed to testing Palindrom + PalindromDOM). It's the fastest and the easiest to run, all you need to do is run:

```sh
npm run test-node
```

2. **Local browser testing:** This allows you to test (Palindrom + PalindromDOM), you can run it by following steps 4, 5, and 6 from [Development section](#Development).

3. **SauceLabs CLI Testing:** This runs in the CLI, but it needs SauceLabs credentials, and Selenium needs to be running, to run it:

    1. Install [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).

    2. Add your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables to your machine.

    3. Connect to SauceLabs using the command
     `sc /u %SAUCE_USERNAME% /k %SAUCE_ACCESS_KEY%` where `sc` is the executable you get when you download **Sauce Connect**.

    4. Start a web server `npm run serve`

    5. In project's root folder, run `npm run test-sauce`


To run all CLI tests together, run:

```sh
npm run test
```
