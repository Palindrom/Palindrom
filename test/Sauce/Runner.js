const CapabilityRunner = require("./CapabilityRunner");

const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;

if (!username) {
  console.error(
    "You need Sauce Labs access to run these specs, if you're a Palindrom org member, please contact @alshakero for this information, if not you need to add your own SauceLabs auth info to your system environment variables."
  );
  process.exit(1);
  
} else {
  const allCaps = [
    {
      browserName: "chrome",
      platform: "Windows 10",
      version: "57.0",
      username: username,
      accessKey: accessKey,
      name: "Chrome: Running tests",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    },
    {
      browserName: "firefox",
      platform: "macOS 10.12",
      version: "52.0",
      username: username,
      accessKey: accessKey,
      name: "Firefox: Running tests",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    },
    {
      browserName: "MicrosoftEdge",
      platform: "Windows 10",
      version: "14",
      username: username,
      accessKey: accessKey,
      name: "MicrosoftEdge: Running tests",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    }
  ];

  const runTestsInChrome = CapabilityRunner(allCaps[0]);
  const runTestsInFirefox = CapabilityRunner(allCaps[1]);
  //const runTestsInEdge = CapabilityRunner(allCaps[2]);

  /* disable Edge, https://github.com/Palindrom/Palindrom/pull/130#discussion_r110376869 */
  Promise.all([runTestsInChrome, runTestsInFirefox /* edgePromise */])
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch(error => {
      console.log(error);
      process.exit(1);
    });
}
