/**
 * SauceLabs Jasmine CapabilityRunner 
 * CapabilityRunner.js 0.0.0
 * (c) 2017 Omar Alshaker
 * MIT license
 */

const isCI = require("is-ci");
const colors = require("colors");
const SauceLabs = require("saucelabs");
const webdriver = require("selenium-webdriver");

function CapabilityRunner(caps, doneCallback) {
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
    "http://127.0.0.1:8000/components/Palindrom/test/MochaSpecRunner.html"
  );

  const symbols = { passed: "√", pending: "-", failed: "x" };

  function checkIfDone(callback) {
    driver.executeScript("return window.testResults;").then(function(results) {
      if (results) {
        callback(results);
      } else {
        setTimeout(() => checkIfDone(callback), 1000);
      }
    });
  }

  driver.getSession().then(sessionID => {
    /* get session ID to finish it later */
    driver.sessionID = sessionID.id_;
    checkIfDone(function(testResults) {
      if (testResults) {
        console.log("Specs finished");
        analyzeResults(testResults);
      }
    }.bind(this));
  });

  function analyzeResults(results) {
    const resultsSummary = { passed: 0, pending: 0, failed: 0 };
    const colorMap = { passed: "green", failed: "red", pending: "yellow" };
    var hadErrored = 0;
    results.forEach(spec => {
      resultsSummary[spec.state]++;
      console.log("");
      console.log(
        "   " + symbols[spec.state][colorMap[spec.state]] + " " + spec.title
      );
      if (spec.state === "failed") {
        hadErrored = 1;
      }
    });
    console.log("");
    console.log(("Summary for (" + caps.name +")")[hadErrored ? 'red': 'green']);
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

    saucelabs.updateJob(driver.sessionID, result, function() {
      doneCallback(hadErrored === 0);
    });
  }
}

module.exports = CapabilityRunner;
