const fs = require("fs");
const convertToGraph = require("../convertToGraph");
const mergeGraphs = require("../mergeGraphs");

describe("should convert Plugin data to graph", () => {
  test("should merge sidecar graphs correctly", () => {
    const host = require(`${__dirname}/mock-data/nextjs-host.json`);
    const sidecar = require(`${__dirname}/mock-data/nextjs-sidecar.json`);
    expect(host.consumes.length).toBe(2);
    expect(sidecar.consumes.length).toBe(1);
    expect(host.modules.length).toBe(1);
    expect(sidecar.modules.length).toBe(4);

    const merged = mergeGraphs(host, sidecar);

    expect(merged.consumes.length).toBe(2);

    expect(merged.modules.length).toBe(4);
    const consumeMerge = merged.consumes.find((i) => {
      return (
        i.consumingApplicationID === "home" &&
        i.applicationID === "checkout" &&
        i.name === "checkout"
      );
    });

    const modulesMerge = merged.modules.find((i) => {
      return (
        i.id === "checkout:title" &&
        i.name === "title" &&
        i.applicationID === "checkout"
      );
    });

    // console.log(merged.overrides)

    expect(JSON.stringify(modulesMerge.requires)).toBe(
      JSON.stringify(["lodash", "react"])
    );
    expect(consumeMerge.usedIn.length).toBe(2);
    expect(merged.id).toBe("home");
    expect(merged.name).toBe("home");
    expect(merged.remote).toBe("http://localhost:3001/remoteEntry.js");
    expect(merged.overrides.length).toBe(5);
  });

  test("should convert raw data to graph", () => {
    const rawData = require(`${__dirname}/mock-data/base-config.json`);
    const graph = convertToGraph(rawData);

    expect(graph.consumes.length).toBe(6);
    expect(graph.dependencies.length).toBe(6);
    expect(graph.devDependencies.length).toBe(11);
    expect(graph.id).toBe("home");
    expect(graph.name).toBe("home");
    expect(graph.remote).toBe("http://localhost:3001/remoteEntry.js");
    expect(graph.modules.length).toBe(2);
    expect(graph.optionalDependencies.length).toBe(0);
    console.log(graph.overrides);
    expect(graph.overrides.length).toBe(3);
  });

  test("should throw Error topLevelPackage.dependencies are not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-dependencies.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "topLevelPackage.dependencies must be defined"
    );
  });

  test("should throw Error topLevelPackage.devDependencies are not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-dev-dependencies.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "topLevelPackage.devDependencies must be defined"
    );
  });

  test("should throw Error topLevelPackage.optionalDependencies are not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-optional-dependencies.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "topLevelPackage.optionalDependencies must be defined"
    );
  });

  test("should throw Error when loc is not provided", () => {
    const rawData = require(`${__dirname}/mock-data/failed-loc-case-config.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "federationRemoteEntry.origins[0].loc must be defined and have a value"
    );
  });

  test("should throw Error when modules parameter not present", () => {
    const rawData = require(`${__dirname}/mock-data/failed-modules-config.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "Modules must be defined and have length"
    );
  });

  test("should throw Error when modules identifier not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-modules-identifier.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "module.identifier must be defined"
    );
  });

  test("should throw Error when modules reasons not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-modules-reasons.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "module.reasons must be defined"
    );
  });

  test("should throw Error when modules issuerName not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-module-issuer-name.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "module.issuerName must be defined"
    );
  });
});
