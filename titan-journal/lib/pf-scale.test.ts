import { describe, expect, it } from "vitest"

import { pfScaleMarkerLeft } from "@/lib/pf-scale"

describe("pfScaleMarkerLeft", () => {
  it("puts profit on the left and loss on the right of the 0–2 track", () => {
    expect(pfScaleMarkerLeft(0)).toBe("100%")
    expect(pfScaleMarkerLeft(1)).toBe("50%")
    expect(pfScaleMarkerLeft(1.95)).toBe("2.5%")
  })

  it("keeps 2 and above just inside the left edge", () => {
    expect(pfScaleMarkerLeft(2)).toBe("10px")
    expect(pfScaleMarkerLeft(3.2)).toBe("10px")
  })
})
