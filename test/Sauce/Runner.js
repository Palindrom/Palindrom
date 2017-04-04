const CapabilityRunner = require("./CapabilityRunner");

const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;

if (!username) {
  console.error(
    "You need Sauce Labs access to run these specs, if you're a Palindrom org member, please contact @alshakero for this information, if not you need to add your own SauceLabs auth info to your system environment variables."
  );
} else {
  const allCaps = [
    {
      browserName: "chrome",
      platform: "Windows 10",
      version: "57.0",
      username: username,
      accessKey: accessKey,
      name: "Chrome: PalindromDOM tests",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    },
    {
      browserName: "firefox",
      platform: "macOS 10.12",
      version: "52.0",
      username: username,
      accessKey: accessKey,
      name: "Firefox: PalindromDOM tests",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    },
    {
      browserName: "MicrosoftEdge",
      platform: "Windows 10",
      version: "14",
      username: username,
      accessKey: accessKey,
      name: "MicrosoftEdge: PalindromDOM tests",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    }
  ];

  CapabilityRunner(allCaps[0], function(passed) {
    if (passed) {
      CapabilityRunner(allCaps[1], function(passed) {
        if (passed) {
          CapabilityRunner(allCaps[2], function(passed) {
            if (passed) {
              console.log("Done!");
              process.exit(0);
            } else {
              process.exit(1);
            }
          });
        } else {
          process.exit(1);
        }
      });
    } else {
      process.exit(1);
    }
  });
}
