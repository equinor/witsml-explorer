import { RequirementPurpose } from "models/dataWorkOrder/requirementPurpose";
import Measure from "models/measure";

export default interface ChannelRequirement {
  uid: string;
  purpose: RequirementPurpose;
  minInterval: Measure;
  maxInterval: Measure;
  minPrecision: Measure;
  maxPrecision: Measure;
  minValue: Measure;
  maxValue: Measure;
  minStep: Measure;
  maxStep: Measure;
  minDelta: Measure;
  maxDelta: Measure;
  latency: Measure;
  mdThreshold: Measure;
  dynamicMdThreshold: boolean;
  comments: string;
}
