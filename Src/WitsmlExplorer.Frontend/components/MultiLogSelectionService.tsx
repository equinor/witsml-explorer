import {
  MultiLogSelectionCurveInfo,
  MultiLogSelectionValues
} from "./MultiLogUtils.tsx";
import { WITSML_INDEX_TYPE } from "./Constants.tsx";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";

const MULTI_LOG_SELECTION_KEY: string = "MULTI_LOG_SELECTION_KEY:";

export default class MultiLogSelectionService {
  private static _instance: MultiLogSelectionService;

  private _onMultilogSelectionStorageUpdated =
    new SimpleEventDispatcher<WITSML_INDEX_TYPE>();

  public static get Instance(): MultiLogSelectionService {
    return this._instance || (this._instance = new this());
  }

  private get Storage(): Storage {
    return localStorage;
  }

  public get onMultilogSelectionStorageUpdated(): ISimpleEvent<WITSML_INDEX_TYPE> {
    return this._onMultilogSelectionStorageUpdated.asEvent();
  }

  public getMultiLogValues(
    indexType: WITSML_INDEX_TYPE
  ): MultiLogSelectionValues {
    const result = this.Storage.getItem(MULTI_LOG_SELECTION_KEY + indexType);
    if (!!result && result !== "undefined" && result.length > 0) {
      try {
        return JSON.parse(result) as MultiLogSelectionValues;
      } catch {
        // console.log(e);
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  public createMultiLogValues(
    indexType: WITSML_INDEX_TYPE,
    values: MultiLogSelectionCurveInfo[]
  ): MultiLogSelectionValues {
    const multiLogValues: MultiLogSelectionValues = {
      curveInfos: this.removeDuplicates(values)
    } as MultiLogSelectionValues;
    this.Storage.setItem(
      MULTI_LOG_SELECTION_KEY + indexType,
      JSON.stringify(multiLogValues)
    );
    this._onMultilogSelectionStorageUpdated.dispatch(indexType);
    return this.getMultiLogValues(indexType);
  }

  public addMultiLogValues(
    indexType: WITSML_INDEX_TYPE,
    values: MultiLogSelectionCurveInfo[],
    createIfNotExist?: boolean
  ): MultiLogSelectionValues {
    const multiLogValues = this.getMultiLogValues(indexType);
    if (multiLogValues) {
      if (!!multiLogValues.curveInfos && multiLogValues.curveInfos.length > 0) {
        multiLogValues.curveInfos = multiLogValues.curveInfos.concat(
          ...this.removeDuplicates(values)
        );
      } else {
        multiLogValues.curveInfos = this.removeDuplicates(values);
      }
      this.Storage.setItem(
        MULTI_LOG_SELECTION_KEY + indexType,
        JSON.stringify(multiLogValues)
      );
      this._onMultilogSelectionStorageUpdated.dispatch(indexType);
      return this.getMultiLogValues(indexType);
    } else if (createIfNotExist) {
      return this.createMultiLogValues(indexType, values);
    } else {
      return undefined;
    }
  }

  public removeMultiLogValues(
    indexType: WITSML_INDEX_TYPE,
    values: MultiLogSelectionCurveInfo[]
  ): boolean {
    const multiLogValues = this.getMultiLogValues(indexType);
    if (
      !!multiLogValues &&
      !!multiLogValues.curveInfos &&
      multiLogValues.curveInfos.length > 0
    ) {
      multiLogValues.curveInfos = multiLogValues.curveInfos.filter(
        (ci) =>
          !values.some(
            (v) =>
              ci.serverId == v.serverId &&
              ci.wellId == v.wellId &&
              ci.wellboreId == v.wellboreId &&
              ci.mnemonic == v.mnemonic
          )
      );
      this.Storage.setItem(
        MULTI_LOG_SELECTION_KEY,
        JSON.stringify(multiLogValues)
      );
      this._onMultilogSelectionStorageUpdated.dispatch(indexType);
      return true;
    } else {
      return false;
    }
  }

  public removeAllMultiLogValues(indexType: WITSML_INDEX_TYPE) {
    this.Storage.setItem(MULTI_LOG_SELECTION_KEY + indexType, undefined);
    this._onMultilogSelectionStorageUpdated.dispatch(indexType);
  }

  private removeDuplicates(
    values: MultiLogSelectionCurveInfo[]
  ): MultiLogSelectionCurveInfo[] {
    return values.filter(
      (v, idx) =>
        values.findIndex(
          (vi) =>
            vi.serverId == v.serverId &&
            vi.wellId == v.wellId &&
            vi.wellboreId == v.wellboreId &&
            vi.logUid == v.logUid &&
            vi.mnemonic == v.mnemonic
        ) == idx
    );
  }
}
