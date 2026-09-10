import { describe, expect, it } from "vitest"

import { pfScaleMarkerLeft } from "@/lib/pf-scale"

describe("pfScaleMarkerLeft", () => {
  it("places values below 2 on the 0–2 track", () => {
    expect(pfScaleMarkerLeft(0)).toBe("0%")
    expect(pfScaleMarkerLeft(1)).toBe("50%")
    expect(pfScaleMarkerLeft(1.95)).toBe("97.5%")
  })

  it("keeps 2 and above just inside the right edge", () => {
    expect(pfScaleMarkerLeft(2)).toBe("calc(100% - 10px)")
    expect(pfScaleMarkerLeft(3.2)).toBe("calc(100% - 10px)")
  })
})
