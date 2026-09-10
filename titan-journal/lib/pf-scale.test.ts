import { describe, expect, it } from "vitest"

import {
  avgRScaleFill,
  avgRScaleMarkerLeft,
  pfScaleMarkerLeft,
} from "@/lib/pf-scale"

describe("pfScaleMarkerLeft", () => {
  it("puts loss on the left and profit on the right of the 0–2 track", () => {
    expect(pfScaleMarkerLeft(0)).toBe("10px")
    expect(pfScaleMarkerLeft(1)).toBe("50%")
    expect(pfScaleMarkerLeft(1.95)).toBe("97.5%")
  })

  it("keeps 2 and above just inside the right edge", () => {
    expect(pfScaleMarkerLeft(2)).toBe("calc(100% - 10px)")
    expect(pfScaleMarkerLeft(3.2)).toBe("calc(100% - 10px)")
    expect(pfScaleMarkerLeft(Infinity)).toBe("calc(100% - 10px)")
  })
})

describe("avgRScaleMarkerLeft", () => {
  it("puts negative R on the left and positive R on the right", () => {
    expect(avgRScaleMarkerLeft(-1)).toBe("25%")
    expect(avgRScaleMarkerLeft(0)).toBe("50%")
    expect(avgRScaleMarkerLeft(1)).toBe("75%")
  })

  it("clamps the marker at ±2 while leaving the numeric KPI uncapped", () => {
    expect(avgRScaleMarkerLeft(-4)).toBe("10px")
    expect(avgRScaleMarkerLeft(4.8)).toBe("calc(100% - 10px)")
    expect(avgRScaleFill(4.8)).toBe(50)
    expect(avgRScaleFill(-0.5)).toBe(12.5)
  })
})
