// Generated by CoffeeScript 1.9.1
(function() {
  var CLI, ChildProcess, DOMParser, Spacejam, expect, fs, isCoffee, path, spacejamBin, xpath;

  path = require('path');

  fs = require('fs');

  DOMParser = require('xmldom').DOMParser;

  xpath = require('xpath');

  expect = require("chai").expect;

  isCoffee = require('./isCoffee');

  if (isCoffee) {
    CLI = require('../../src/CLI');
    ChildProcess = require('../../src/ChildProcess');
    Spacejam = require('../../src/Spacejam');
    spacejamBin = require.resolve("../../bin/spacejam.coffee");
  } else {
    CLI = require('../../lib/CLI');
    ChildProcess = require('../../lib/ChildProcess');
    Spacejam = require('../../lib/Spacejam');
    spacejamBin = require.resolve("../../bin/spacejam");
  }

  log.info(spacejamBin);

  describe("spacejam", function() {
    var spacejamChild, spacejamChild2, standAlonePackage, testApp1, testApp2;
    this.timeout(60000);
    spacejamChild = null;
    spacejamChild2 = null;
    testApp1 = "leaderboard";
    testApp2 = "todos";
    standAlonePackage = "../packages/standalone-package";
    before(function() {
      return log.debug("spacejam.before");
    });
    beforeEach(function() {
      log.debug("spacejam.beforeEach");
      process.chdir(__dirname + "/../apps/leaderboard");
      delete process.env.PORT;
      delete process.env.ROOT_URL;
      delete process.env.MONGO_URL;
      delete process.env.PACKAGE_DIRS;
      return spacejamChild = new ChildProcess();
    });
    afterEach(function() {
      log.debug("spacejam.afterEach");
      try {
        if (spacejamChild != null) {
          spacejamChild.kill('SIGPIPE');
        }
      } finally {
        spacejamChild = null;
      }
      try {
        return spacejamChild2 != null ? spacejamChild2.kill('SIGPIPE') : void 0;
      } finally {
        spacejamChild2 = null;
      }
    });
    describe("test-packages", function() {
      it("should exit with 0 if tests pass for a meteor app package. Also verifies METEOR_TEST_PACKAGES is '1'", function(done) {
        var args;
        spacejamChild = new ChildProcess();
        args = ["test-packages", "success"];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with errors").to.equal(Spacejam.DONE.TEST_SUCCESS);
            return done();
          };
        })(this));
      });
      it("should exit with 0 if tests pass for a standalone package", function(done) {
        var args;
        process.chdir(__dirname + "/../packages/standalone-package");
        process.env.PACKAGE_DIRS = path.normalize(__dirname + '/../packages');
        spacejamChild = new ChildProcess();
        args = ["test-packages", "./"];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with errors").to.equal(Spacejam.DONE.TEST_SUCCESS);
            return done();
          };
        })(this));
      });
      it("should execute multiple independent package tests provided by path while not in a meteor app or package folder", function(done) {
        var args;
        process.chdir(path.resolve(__dirname, ".."));
        spacejamChild = new ChildProcess();
        args = ["test-packages", "packages/standalone-package-dep", 'apps/leaderboard/packages/success'];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            var err;
            try {
              expect(code, "spacejam exited with errors").to.equal(Spacejam.DONE.TEST_SUCCESS);
              return done();
            } catch (_error) {
              err = _error;
              return done(err);
            }
          };
        })(this));
      });
      it("should exit with 3, if meteor couldn't find package", function(done) {
        var args;
        process.chdir(__dirname);
        spacejamChild = new ChildProcess();
        args = ["test-packages", "success"];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.METEOR_ERROR);
            return done();
          };
        })(this));
      });
      it("should exit with 3, if package could not be found", function(done) {
        var args;
        spacejamChild = new ChildProcess();
        args = ["test-packages", standAlonePackage];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with errors").to.equal(Spacejam.DONE.METEOR_ERROR);
            return done();
          };
        })(this));
      });
      it("should exit with 2, if tests failed", function(done) {
        var args, testPort;
        spacejamChild = new ChildProcess();
        testPort = "6096";
        args = ["test-packages", "--port", testPort, "failure"];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.TEST_FAILED);
            return done();
          };
        })(this));
      });
      it("should exit with 4, if --timeout has passed", function(done) {
        var args, testPort;
        spacejamChild = new ChildProcess();
        testPort = "7096";
        args = ["test-packages", "--timeout", "30000", "--port", testPort, 'timeout'];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.TEST_TIMEOUT);
            return done();
          };
        })(this));
      });
      it("should exit with 2, if the meteor app crashes", function(done) {
        var args, testPort;
        this.timeout(90000);
        process.chdir(__dirname + "/../apps/todos");
        spacejamChild = new ChildProcess();
        testPort = "8096";
        args = ["test-packages", "--port", testPort, 'appfails'];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code).to.equal(Spacejam.DONE.METEOR_ERROR);
            return done();
          };
        })(this));
      });
      it("should exit with 6, if the tests contain an error", function(done) {
        var args, testPort;
        this.timeout(90000);
        process.chdir(__dirname + "/../apps/todos");
        spacejamChild = new ChildProcess();
        testPort = "8096";
        args = ["test-packages", "--port", testPort, 'appclientsideerror'];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code).to.equal(Spacejam.DONE.CLIENT_ERROR);
            return done();
          };
        })(this));
      });
      it("should save xunit output to file, if --xunit-out is specified", function(done) {
        var args, testPort;
        spacejamChild = new ChildProcess();
        testPort = "20096";
        args = ["test-packages", "--port", testPort, '--xunit-out', '/tmp/xunit.xml', "success"];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("close", (function(_this) {
          return function(code, signal) {
            var ex, testCaseNodes, xml, xmlDom;
            try {
              expect(code, "spacejam exited with errors").to.equal(Spacejam.DONE.TEST_SUCCESS);
              xml = fs.readFileSync('/tmp/xunit.xml', {
                encoding: 'utf8'
              });
              log.debug(xml);
              expect(xml).to.be.ok;
              xmlDom = new DOMParser().parseFromString(xml);
              expect(xmlDom.documentElement.tagName).to.equal('testsuite');
              testCaseNodes = xpath.select("//testcase", xmlDom);
              expect(testCaseNodes).to.have.length(3);
              return done();
            } catch (_error) {
              ex = _error;
              return done(ex);
            }
          };
        })(this));
      });
      return it("should exit with 0, in case of a complete test, with a settings file, multiple packages, including wildcards in package names", function(done) {
        var args, testPort;
        spacejamChild = new ChildProcess();
        testPort = "10096";
        args = ["test-packages", "--settings", "settings.json", "--port", testPort, 'packages/settings', 'success*'];
        spacejamChild.spawn(spacejamBin, args);
        return spacejamChild.child.on("exit", (function(_this) {
          return function(code) {
            expect(code, "spacejam exited with errors").to.equal(Spacejam.DONE.TEST_SUCCESS);
            return done();
          };
        })(this));
      });
    });
    describe("package-version", function() {
      return it("should print the package version", function(done) {
        process.chdir(__dirname + "/../packages/standalone-package");
        spacejamChild = new ChildProcess();
        return spacejamChild.exec(spacejamBin + " package-version", null, (function(_this) {
          return function(err, stdout, stderr) {
            try {
              expect(err).to.be["null"];
              expect(stdout.toString()).to.contain('0.9.5');
              return done();
            } catch (_error) {
              err = _error;
              return done(err);
            }
          };
        })(this));
      });
    });
    return describe("test", function() {
      describe("--full-app mode", function() {
        it("should exit with 0 with successful tests", function(done) {
          var args;
          process.chdir(__dirname + "/../apps/passing-app-tests");
          args = ["test", "--driver-package", "practicalmeteor:mocha-console-runner", "--full-app"];
          spacejamChild.spawn(spacejamBin, args);
          return spacejamChild.child.on("exit", (function(_this) {
            return function(code) {
              expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.TEST_SUCCESS);
              return done();
            };
          })(this));
        });
        return it("should exit with 1 with successful tests", function(done) {
          var args;
          process.chdir(__dirname + "/../apps/failing-app-tests");
          args = ["test", "--driver-package", "practicalmeteor:mocha-console-runner", "--full-app"];
          args = ["test", "--driver-package", "practicalmeteor:mocha-console-runner", "--full-app"];
          spacejamChild.spawn(spacejamBin, args);
          return spacejamChild.child.on("exit", (function(_this) {
            return function(code) {
              expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.TEST_FAILED);
              return done();
            };
          })(this));
        });
      });
      return describe("unit tests mode", function() {
        it("should exit with 0 with successful tests", function(done) {
          var args;
          process.chdir(__dirname + "/../apps/passing-app-tests");
          args = ["test", "--driver-package", "practicalmeteor:mocha-console-runner"];
          spacejamChild.spawn(spacejamBin, args);
          return spacejamChild.child.on("exit", (function(_this) {
            return function(code) {
              expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.TEST_SUCCESS);
              return done();
            };
          })(this));
        });
        return it("should exit with 2 with failed tests", function(done) {
          var args;
          process.chdir(__dirname + "/../apps/failing-app-tests");
          args = ["test", "--driver-package", "practicalmeteor:mocha-console-runner"];
          spacejamChild.spawn(spacejamBin, args);
          return spacejamChild.child.on("exit", (function(_this) {
            return function(code) {
              expect(code, "spacejam exited with the wrong code").to.equal(Spacejam.DONE.TEST_FAILED);
              return done();
            };
          })(this));
        });
      });
    });
  });

}).call(this);
