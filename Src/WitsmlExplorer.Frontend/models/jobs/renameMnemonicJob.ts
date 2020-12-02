import LogReference from "./logReference";

export default interface RenameMnemonicJob {
  logReference: LogReference;
  mnemonic: string;
  newMnemonic: string;
}
