/**
 * SauceLabs Mocha CapabilityRunner 
 * CapabilityRunner.js 0.0.0
 * (c) 2017 Omar Alshaker
 * MIT license
 */

const colors = require("colors");
const SauceLabs = require("saucelabs").default;
const webdriver = require("selenium-webdriver");
const Promise = require("bluebird");
const retryUntil = require("bluebird-retry");

function CapabilityRunner(caps) {
  return new Promise(function(resolve, reject) {
    console.log("");
    console.log(caps.name.green);

    const username = caps.username;
    const accessKey = caps.accessKey;

    const saucelabs = new SauceLabs({
      username: username,
      password: accessKey
    });

    const By = webdriver.By;

    let driver = new webdriver.Builder()
      .withCapabilities(caps)
      .usingServer(
        "http://" + username + ":" + accessKey + "@localhost:4445/wd/hub"
      )
      .build();

    driver.get(
      "http://localhost:5000/test/MochaSpecRunner.html"
    );

    const symbols = { passed: "√", pending: "-", failed: "x" };

    function checkIfDone() {
      return new Promise(function(resolve, reject) {
        driver
          .executeScript("return window.testResults;")
          .then(function(results) {
            if (results) {
              resolve(results);
            } else {
              reject("No test results (`window.testResults`), probably tests haven't finished yet.");
            }
          });
      });
    }
    /* get session ID and keep checking if tests are finished */
    driver.getSession().then(sessionID => {
      /*set driver ID to end session later */
      driver.sessionID = sessionID.id_; 
      // let tests execute for 2 minutes (10 * 15 seconds)
      retryUntil(checkIfDone, { interval: 15000, max_tries: 10 }).then(testResults => {
        console.log("Specs finished");
        analyzeResults(testResults);
      }).catch(error => {
        console.log(`${caps.name}: ${error}`);
        process.exit(1);
      });
    });

    function analyzeResults(results) {
      const resultsSummary = { passed: 0, pending: 0, failed: 0 };
      const colorMap = { passed: "green", failed: "red", pending: "yellow" };
      var hadErrored = 0;
      function coloredFullTitle(titlePath){
        return titlePath.slice(0,-1).map((e)=>e.grey).concat(titlePath.slice(-1)).join(' > ');
      }
      results.forEach(spec => {
        resultsSummary[spec.state]++;
        console.log("");
        const coloredTitle = coloredFullTitle(spec.titlePath);
        console.log(
          "   " + symbols[spec.state][colorMap[spec.state]] + " " + coloredTitle
        );
        if (spec.state === "failed") {
          hadErrored = 1;
          console.log(`Spec "${coloredTitle}" failed, the error was`, spec.err, spec.err && spec.err.stack);
        }
      });
      console.log("");
      console.log(
        ("Summary for (" + caps.name + ")")[hadErrored ? "red" : "green"]
      );
      console.log(resultsSummary);
      console.log("");
      console.log("Ending session: " + driver.sessionID);

      const result = {
        name: "Summary: Passed: " +
          resultsSummary.passed +
          ", pending: " +
          resultsSummary.pending +
          ", failed: " +
          resultsSummary.failed,
        passed: hadErrored === 0
      };

      driver.quit();

      saucelabs.updateJob(username, driver.sessionID, result).then(function() {
        if (hadErrored === 0) {
          resolve();
        } else {
          reject(caps.name + " failed");
        }
      });
    }
  });
}

module.exports = CapabilityRunner;
