export default interface ConfigurationChangeReason {
  changedBy: string;
  dTimChanged: string;
  isChangedDataRequirements: boolean;
  comments: string;
  channelsAdded: string[];
  channelsModified: string[];
  channelsRemoved: string[];
}
