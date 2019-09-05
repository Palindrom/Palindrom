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
      flags: ['--enable-experimental-web-platform-features'],
      username: username,
      accessKey: accessKey,
      name: "Palindrom in Chrome",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    },
    {
      browserName: "firefox",
      platform: "Windows 10",
      username: username,
      accessKey: accessKey,
      name: "Palindrom in Firefox",
      "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
    }
  ];

  (async function() {
      try {
          await CapabilityRunner(allCaps[0]);
          await CapabilityRunner(allCaps[1]);

          console.log('Done!');
          process.exit(0);
      } catch (error) {
          console.log(error);
          process.exit(1);
      }
  })();
}