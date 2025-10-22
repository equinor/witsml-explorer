import { SectionOrderStatus } from "../../../../models/dataWorkOrder/sectionOrderStatus.ts";

export const SECTION_ORDER_VARIANT: {
  [key in SectionOrderStatus]: "error" | "active" | "default";
} = {
  [SectionOrderStatus.Approved]: "active",
  [SectionOrderStatus.Submitted]: "active",
  [SectionOrderStatus.Draft]: "default",
  [SectionOrderStatus.NoOrderedCurves]: "default"
};
