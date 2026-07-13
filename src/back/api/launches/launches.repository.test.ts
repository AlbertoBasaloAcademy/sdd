import assert from "node:assert";
import { describe, it } from "node:test";
import { findAllRockets, initRocketsRepository } from "../rockets/rockets.repository.js";
import {
  findAllLaunches,
  findLaunchById,
  initLaunchesRepository,
  insertLaunch,
  updateLaunch,
} from "./launches.repository.js";

describe("launches repository", () => {
  initRocketsRepository();
  initLaunchesRepository();

  const activeRocketId = findAllRockets().find((rocket) => rocket.status === "Active")!.id;
  const futureDate = new Date(Date.now() + 86_400_000).toISOString();

  it("findAllLaunches returns an array", () => {
    const launches = findAllLaunches();
    assert.ok(Array.isArray(launches));
  });

  it("insertLaunch creates and returns a launch", () => {
    const created = insertLaunch({
      price_per_passenger: 1500,
      rocket_id: activeRocketId,
      scheduled_at: futureDate,
      status: "created",
    });

    assert.ok(created.id);
    assert.strictEqual(created.status, "created");
    assert.strictEqual(findLaunchById(created.id)?.rocket_id, activeRocketId);
  });

  it("updateLaunch updates an existing launch", () => {
    const created = insertLaunch({
      price_per_passenger: 2000,
      rocket_id: activeRocketId,
      scheduled_at: futureDate,
      status: "created",
    });

    const updated = updateLaunch(created.id, {
      price_per_passenger: 2500,
      rocket_id: activeRocketId,
      scheduled_at: futureDate,
      status: "confirmed",
    });

    assert.ok(updated);
    assert.strictEqual(updated.status, "confirmed");
    assert.strictEqual(findLaunchById(created.id)?.price_per_passenger, 2500);
  });
});
