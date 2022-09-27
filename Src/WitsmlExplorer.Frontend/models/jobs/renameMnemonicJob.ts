import ObjectReference from "./objectReference";

export default interface RenameMnemonicJob {
  logReference: ObjectReference;
  mnemonic: string;
  newMnemonic: string;
}
