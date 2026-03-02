export interface MnemonicsMappingsQuery {
  sourceVendors?: string[];
  sourceVendorsMnemonics?: string[];
  returnGlobalMnemonics?: boolean;
}

export interface MnemonicsMappingsResultItem {
  vendor: string;
  globalMnemonicName: string;
  vendorMnemonicName: string;
}

export interface MnemonicsMappingsQueryResult {
  mappings: MnemonicsMappingsResultItem[];
}
