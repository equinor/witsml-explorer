import {
  Accordion,
  Autocomplete,
  Icon,
  Radio,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { useClipboardMixedObjectsReferences } from "components/ContextMenus/UseClipboardReferences";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import { Chip } from "components/StyledComponents/Chip";
import WarningBar from "components/WarningBar";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { DecimalPreference } from "contexts/operationStateReducer";
import { useServerFilter } from "hooks/useServerFilter";
import EntityType from "models/entityType";
import { ObjectType } from "models/objectType";
import WellboreReference from "models/jobs/wellboreReference";
import WellboreSubObjectsComparisonJob, {
  DecimalComparisonMode,
  LogMapping,
  TimezoneComparisonMode
} from "models/jobs/wellboreSubObjectsComparisonJob";
import LogObject from "models/logObject";
import MultiLogCurveInfo from "models/multilogCurveInfo";
import MaxLength from "models/maxLength";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import {
  ChangeEvent,
  CSSProperties,
  useEffect,
  useMemo,
  useState
} from "react";
import JobService, { JobType } from "services/jobService";
import LogObjectService from "services/logObjectService";
import ObjectService from "services/objectService";
import WellboreService from "services/wellboreService";
import styled from "styled-components";
import { ReportModal } from "./ReportModal";
import { StyledNativeSelect } from "components/Select";
import StyledAccordion from "../StyledComponents/StyledAccordion";
import { StyledAccordionHeader } from "./LogComparisonModal";
import { LogHeaderDateTimeField } from "./LogHeaderDateTimeField";

export interface WellborePickerProps {
  selectedWellbore: Wellbore;
}

enum CheckOptions {
  CompareNumberOfDataPointsPerMnemonic = "CompareNumberOfDataPointsPerMnemonic",
  CompareValuesOfDataPointsPerMnemonic = "CompareValuesOfDataPointsPerMnemonic",
  None = "None"
}

const AVAILABLE_SUB_OBJECTS: { type: EntityType; label: string }[] = [
  { type: EntityType.Trajectory, label: "Trajectories" },
  { type: EntityType.Tubular, label: "Tubulars" },
  { type: EntityType.MudLog, label: "MudLogs" },
  { type: EntityType.Log, label: "Logs" },
  { type: EntityType.Rig, label: "Rigs" },
  { type: EntityType.BhaRun, label: "BHA Runs" },
  { type: EntityType.FluidsReport, label: "Fluids Reports" },
  { type: EntityType.FormationMarker, label: "Formation Markers" },
  { type: EntityType.Message, label: "Messages" },
  { type: EntityType.Risk, label: "Risks" },
  { type: EntityType.WbGeometry, label: "WB Geometries" },
  { type: EntityType.DataWorkOrder, label: "Data Work Orders" },
  { type: EntityType.Attachment, label: "Attachments" }
];

export interface AvailableLogOption {
  uid: string;
  name: string;
  indexType?: string;
  serverPresence: string;
}

export interface MnemonicOption {
  key: string;
  mnemonic: string;
  logUid: string;
  logName: string;
  unit?: string;
  curveDescription?: string;
}

const WellborePickerModal = ({
  selectedWellbore
}: WellborePickerProps): React.ReactElement => {
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const [targetServer, setTargetServer] = useState<Server>();
  const [wellUid, setWellUid] = useState<string>(selectedWellbore.wellUid);
  const [wellboreUid, setWellboreUid] = useState<string>(selectedWellbore.uid);
  const [selectedCheckOption, setSelectedCheckOption] = useState<CheckOptions>(
    CheckOptions.None
  );

  // Sub-object scope
  const [compareWellboreMetadata, setCompareWellboreMetadata] =
    useState<boolean>(true);
  const [compareAllObjects, setCompareAllObjects] = useState<boolean>(true);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<EntityType[]>(
    AVAILABLE_SUB_OBJECTS.map((o) => o.type)
  );
  const [deepCompareObjects, setDeepCompareObjects] = useState<boolean>(true);
  const [matchByNameIfUidDiffers, setMatchByNameIfUidDiffers] =
    useState<boolean>(false);

  // Deep comparison metadata & precision
  const [omitCustomData, setOmitCustomData] = useState<boolean>(true);
  const [omitTimestamps, setOmitTimestamps] = useState<boolean>(true);
  const [reportAllMismatches, setReportAllMismatches] = useState<boolean>(true);
  const [decimalMode, setDecimalMode] = useState<DecimalComparisonMode>(
    DecimalComparisonMode.ServerSettings
  );
  const [customDecimalPlaces, setCustomDecimalPlaces] = useState<number>(3);
  const [timezoneMode, setTimezoneMode] = useState<TimezoneComparisonMode>(
    TimezoneComparisonMode.Utc
  );

  // Log index type & specific log filtering
  const [compareDepthLogs, setCompareDepthLogs] = useState<boolean>(true);
  const [compareTimeLogs, setCompareTimeLogs] = useState<boolean>(true);
  const [specificLogFilter, setSpecificLogFilter] = useState<string>("");
  const [specificMnemonicFilter, setSpecificMnemonicFilter] =
    useState<string>("");
  const [selectedLogOptions, setSelectedLogOptions] = useState<
    AvailableLogOption[]
  >([]);
  const [isManualLogInput, setIsManualLogInput] = useState<boolean>(false);
  const [availableMnemonics, setAvailableMnemonics] = useState<
    MnemonicOption[]
  >([]);
  const [selectedMnemonicOptions, setSelectedMnemonicOptions] = useState<
    MnemonicOption[]
  >([]);
  const [isLoadingCurves, setIsLoadingCurves] = useState<boolean>(false);
  const [isManualMnemonicInput, setIsManualMnemonicInput] =
    useState<boolean>(false);
  const [isCurvesExpanded, setIsCurvesExpanded] = useState<boolean>(false);

  // Explicit log mapping
  const [logMappings, setLogMappings] = useState<LogMapping[]>([]);
  const [sourceLogs, setSourceLogs] = useState<LogObject[]>([]);
  const [targetLogs, setTargetLogs] = useState<LogObject[]>([]);
  const [selectedSourceLog, setSelectedSourceLog] = useState<LogObject | null>(
    null
  );
  const [selectedTargetLog, setSelectedTargetLog] = useState<LogObject | null>(
    null
  );
  const [manualSourceLogUid, setManualSourceLogUid] = useState<string>("");
  const [manualTargetLogUid, setManualTargetLogUid] = useState<string>("");
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const wellboreWithMixedObjectsReference =
    useClipboardMixedObjectsReferences();

  const { connectedServer } = useConnectedServer();

  const {
    operationState: { colors, timeZone, decimals },
    dispatchOperation
  } = useOperationState();

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [performDeepLogComparison, setPerformDeepLogComparison] =
    useState(false);
  const [
    compareNumbersOfDataPointsForDepth,
    setCompareNumbersOfDataPointsForDepth
  ] = useState(false);
  const [
    compareNumbersOfDataPointsForTime,
    setCompareNumbersOfDataPointsForTime
  ] = useState(false);
  const [
    compareValuesOfDataPointsForDepth,
    setCompareValuesOfDataPointsForDepth
  ] = useState(false);
  const [
    compareValuesOfDataPointsForTime,
    setCompareValuesOfDataPointsForTime
  ] = useState(false);

  // Deep log sampling & range states
  const [depthSamplingMode, setDepthSamplingMode] = useState<string>("all");
  const [customDepthInterval, setCustomDepthInterval] = useState<string>("");
  const [depthStartIndex, setDepthStartIndex] = useState<string>("");
  const [depthEndIndex, setDepthEndIndex] = useState<string>("");

  const [timeSamplingMode, setTimeSamplingMode] = useState<string>("all");
  const [customTimeInterval, setCustomTimeInterval] = useState<string>("");
  const [timeStartIndex, setTimeStartIndex] = useState<string>("");
  const [timeEndIndex, setTimeEndIndex] = useState<string>("");

  const onClear = () => {
    setWellUid("");
    setWellboreUid("");
    setSelectedLogOptions([]);
    setAvailableMnemonics([]);
    setSelectedMnemonicOptions([]);
    setSpecificLogFilter("");
    setSpecificMnemonicFilter("");
    setIsManualLogInput(false);
    setIsManualMnemonicInput(false);
    setDepthSamplingMode("all");
    setCustomDepthInterval("");
    setDepthStartIndex("");
    setDepthEndIndex("");
    setTimeSamplingMode("all");
    setCustomTimeInterval("");
    setTimeStartIndex("");
    setTimeEndIndex("");
  };

  const onReset = () => {
    setWellUid(selectedWellbore.wellUid);
    setWellboreUid(selectedWellbore.uid);
    setSelectedLogOptions([]);
    setAvailableMnemonics([]);
    setSelectedMnemonicOptions([]);
    setSpecificLogFilter("");
    setSpecificMnemonicFilter("");
    setIsManualLogInput(false);
    setIsManualMnemonicInput(false);
    setDepthSamplingMode("all");
    setCustomDepthInterval("");
    setDepthStartIndex("");
    setDepthEndIndex("");
    setTimeSamplingMode("all");
    setCustomTimeInterval("");
    setTimeStartIndex("");
    setTimeEndIndex("");
  };

  const onPaste = () => {
    setWellUid(wellboreWithMixedObjectsReference.wellboreReference.wellUid);
    setWellboreUid(
      wellboreWithMixedObjectsReference.wellboreReference.wellboreUid
    );
  };

  const toggleObjectType = (type: EntityType) => {
    if (selectedObjectTypes.includes(type)) {
      setSelectedObjectTypes(selectedObjectTypes.filter((t) => t !== type));
    } else {
      setSelectedObjectTypes([...selectedObjectTypes, type]);
    }
  };

  const loadLogs = async () => {
    if (!targetServer || !wellUid || !wellboreUid) return;
    setIsLoadingLogs(true);
    try {
      const [srcLogs, tgtLogs] = await Promise.all([
        ObjectService.getObjects(
          selectedWellbore.wellUid,
          selectedWellbore.uid,
          ObjectType.Log,
          null,
          connectedServer
        ),
        ObjectService.getObjects(
          wellUid,
          wellboreUid,
          ObjectType.Log,
          null,
          targetServer
        )
      ]);
      setSourceLogs(srcLogs ?? []);
      setTargetLogs(tgtLogs ?? []);
    } catch (err) {
      console.error("Failed to load logs for mapping:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const addLogMapping = () => {
    const sUid = selectedSourceLog?.uid || manualSourceLogUid.trim();
    const sName = selectedSourceLog?.name || manualSourceLogUid.trim();
    const tUid = selectedTargetLog?.uid || manualTargetLogUid.trim();
    const tName = selectedTargetLog?.name || manualTargetLogUid.trim();
    if (!sUid || !tUid) return;

    setLogMappings([
      ...logMappings,
      {
        sourceLogUid: sUid,
        sourceLogName: sName,
        targetLogUid: tUid,
        targetLogName: tName
      }
    ]);
    setSelectedSourceLog(null);
    setSelectedTargetLog(null);
    setManualSourceLogUid("");
    setManualTargetLogUid("");
  };

  const removeLogMapping = (index: number) => {
    setLogMappings(logMappings.filter((_, i) => i !== index));
  };

  const availableLogOptions = useMemo<AvailableLogOption[]>(() => {
    const map = new Map<string, AvailableLogOption>();
    sourceLogs.forEach((l) => {
      map.set(l.uid, {
        uid: l.uid,
        name: l.name || l.uid,
        indexType: l.indexType,
        serverPresence: "Source"
      });
    });
    targetLogs.forEach((l) => {
      if (map.has(l.uid)) {
        const existing = map.get(l.uid);
        existing.serverPresence = "Both servers";
        if (!existing.indexType && l.indexType)
          existing.indexType = l.indexType;
      } else {
        map.set(l.uid, {
          uid: l.uid,
          name: l.name || l.uid,
          indexType: l.indexType,
          serverPresence: "Target"
        });
      }
    });
    let logs = Array.from(map.values());
    if (!compareDepthLogs && !compareTimeLogs) {
      logs = [];
    } else if (compareDepthLogs && !compareTimeLogs) {
      logs = logs.filter(
        (l) => !l.indexType || !l.indexType.toLowerCase().includes("time")
      );
    } else if (!compareDepthLogs && compareTimeLogs) {
      logs = logs.filter(
        (l) => l.indexType && l.indexType.toLowerCase().includes("time")
      );
    }
    return logs.sort((a, b) =>
      (a.name || a.uid).localeCompare(b.name || b.uid)
    );
  }, [sourceLogs, targetLogs, compareDepthLogs, compareTimeLogs]);

  useEffect(() => {
    setSelectedLogOptions((prev) =>
      prev
        .map((p) => availableLogOptions.find((opt) => opt.uid === p.uid))
        .filter((opt): opt is AvailableLogOption => Boolean(opt))
    );
  }, [availableLogOptions]);

  useEffect(() => {
    if (selectedLogOptions.length === 0) {
      setAvailableMnemonics([]);
      setSelectedMnemonicOptions([]);
      return;
    }

    const abortController = new AbortController();
    const fetchCurves = async () => {
      setIsLoadingCurves(true);
      try {
        const sourceUids = selectedLogOptions
          .filter((opt) => sourceLogs.some((sl) => sl.uid === opt.uid))
          .map((opt) => opt.uid);
        const targetUids = selectedLogOptions
          .filter((opt) => targetLogs.some((tl) => tl.uid === opt.uid))
          .map((opt) => opt.uid);

        const promises: Promise<MultiLogCurveInfo[]>[] = [];
        if (sourceUids.length > 0 && connectedServer) {
          promises.push(
            LogObjectService.getMultiLogsCurveInfo(
              selectedWellbore.wellUid,
              selectedWellbore.uid,
              sourceUids,
              abortController.signal,
              connectedServer
            ).catch((err) => {
              console.error(
                "Failed to fetch curve info from source server:",
                err
              );
              return [];
            })
          );
        }
        if (targetUids.length > 0 && targetServer && wellUid && wellboreUid) {
          promises.push(
            LogObjectService.getMultiLogsCurveInfo(
              wellUid,
              wellboreUid,
              targetUids,
              abortController.signal,
              targetServer
            ).catch((err) => {
              console.error(
                "Failed to fetch curve info from target server:",
                err
              );
              return [];
            })
          );
        }

        const results = await Promise.all(promises);
        const rawCurves = results.flat().filter(Boolean);

        const mnemonicMap = new Map<string, MnemonicOption>();
        rawCurves.forEach((c) => {
          if (!c?.mnemonic) return;
          const key = `${c.logUid}::${c.mnemonic.trim().toUpperCase()}`;
          const parentLog =
            selectedLogOptions.find((lo) => lo.uid === c.logUid) ||
            sourceLogs.find((sl) => sl.uid === c.logUid) ||
            targetLogs.find((tl) => tl.uid === c.logUid);
          const logName = parentLog?.name || c.logUid || "Unknown Log";

          if (!mnemonicMap.has(key)) {
            mnemonicMap.set(key, {
              key,
              mnemonic: c.mnemonic.trim(),
              logUid: c.logUid,
              logName,
              unit: c.unit,
              curveDescription: c.curveDescription
            });
          } else {
            const existing = mnemonicMap.get(key);
            if (!existing.unit && c.unit) existing.unit = c.unit;
            if (!existing.curveDescription && c.curveDescription) {
              existing.curveDescription = c.curveDescription;
            }
          }
        });

        const sortedMnemonics = Array.from(mnemonicMap.values()).sort(
          (a, b) =>
            a.logName.localeCompare(b.logName) ||
            a.mnemonic.localeCompare(b.mnemonic)
        );

        setAvailableMnemonics(sortedMnemonics);
        setSelectedMnemonicOptions((prev) => {
          const updated = prev
            .filter((m) => selectedLogOptions.some((lo) => lo.uid === m.logUid))
            .map((m) => sortedMnemonics.find((opt) => opt.key === m.key))
            .filter((opt): opt is MnemonicOption => Boolean(opt));
          return updated;
        });
      } catch (err) {
        console.error("Error loading curve info:", err);
      } finally {
        setIsLoadingCurves(false);
      }
    };

    fetchCurves();

    return () => {
      abortController.abort();
    };
  }, [
    selectedLogOptions,
    sourceLogs,
    targetLogs,
    connectedServer,
    targetServer,
    wellUid,
    wellboreUid,
    selectedWellbore
  ]);

  const handleLogSelectionChange = (items: AvailableLogOption[]) => {
    setSelectedLogOptions(items);
    setSpecificLogFilter(items.map((l) => l.name || l.uid).join(", "));
  };

  const handleMnemonicChange = (items: MnemonicOption[]) => {
    setSelectedMnemonicOptions(items);
    const uniqueMnemonics = Array.from(new Set(items.map((i) => i.mnemonic)));
    setSpecificMnemonicFilter(uniqueMnemonics.join(", "));
  };

  const handleSelectAllMnemonics = () => {
    setSelectedMnemonicOptions(availableMnemonics);
    const uniqueMnemonics = Array.from(
      new Set(availableMnemonics.map((i) => i.mnemonic))
    );
    setSpecificMnemonicFilter(uniqueMnemonics.join(", "));
  };

  const handleClearAllMnemonics = () => {
    setSelectedMnemonicOptions([]);
    setSpecificMnemonicFilter("");
  };

  const switchToLogDropdown = () => {
    setIsManualLogInput(false);
    if (specificLogFilter.trim()) {
      const parts = specificLogFilter
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const matched = availableLogOptions.filter(
        (l) =>
          parts.includes(l.name.toLowerCase()) ||
          parts.includes(l.uid.toLowerCase())
      );
      if (matched.length > 0) {
        setSelectedLogOptions(matched);
      }
    }
  };

  const switchToMnemonicDropdown = () => {
    setIsManualMnemonicInput(false);
    if (specificMnemonicFilter.trim()) {
      const parts = specificMnemonicFilter
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const matched = availableMnemonics.filter((m) =>
        parts.includes(m.mnemonic.toLowerCase())
      );
      if (matched.length > 0) {
        setSelectedMnemonicOptions(matched);
      }
    }
  };

  interface SelectedCurveBadge {
    type: "summary" | "curve";
    key: string;
    label: string;
    subLabel?: string;
    logUid?: string;
    curveKey?: string;
  }

  const selectedCurveBadges = useMemo<SelectedCurveBadge[]>(() => {
    if (selectedMnemonicOptions.length === 0) return [];
    const badges: SelectedCurveBadge[] = [];
    const processedLogUids = new Set<string>();

    selectedLogOptions.forEach((log) => {
      processedLogUids.add(log.uid);
      const logAvailable = availableMnemonics.filter(
        (m) => m.logUid === log.uid
      );
      const logSelected = selectedMnemonicOptions.filter(
        (m) => m.logUid === log.uid
      );
      if (
        logAvailable.length > 0 &&
        logSelected.length === logAvailable.length
      ) {
        badges.push({
          type: "summary",
          key: `all-${log.uid}`,
          label: `All ${logAvailable.length} curves in ${log.name}`,
          logUid: log.uid
        });
      } else {
        logSelected.forEach((m) => {
          badges.push({
            type: "curve",
            key: m.key,
            label: m.mnemonic,
            subLabel: selectedLogOptions.length > 1 ? m.logName : undefined,
            curveKey: m.key
          });
        });
      }
    });

    selectedMnemonicOptions.forEach((m) => {
      if (!processedLogUids.has(m.logUid)) {
        badges.push({
          type: "curve",
          key: m.key,
          label: m.mnemonic,
          subLabel: m.logName,
          curveKey: m.key
        });
      }
    });

    return badges;
  }, [selectedLogOptions, availableMnemonics, selectedMnemonicOptions]);

  const isDepthIndexApplicable = useMemo(() => {
    if (!compareDepthLogs) return false;
    if (selectedLogOptions.length === 0) return true;
    return selectedLogOptions.some(
      (l) => !l.indexType || !l.indexType.toLowerCase().includes("time")
    );
  }, [compareDepthLogs, selectedLogOptions]);

  const isTimeIndexApplicable = useMemo(() => {
    if (!compareTimeLogs) return false;
    if (selectedLogOptions.length === 0) return true;
    return selectedLogOptions.some(
      (l) => l.indexType && l.indexType.toLowerCase().includes("time")
    );
  }, [compareTimeLogs, selectedLogOptions]);

  useEffect(() => {
    if (!isDepthIndexApplicable) {
      setCompareNumbersOfDataPointsForDepth(false);
      setCompareValuesOfDataPointsForDepth(false);
    }
  }, [isDepthIndexApplicable]);

  useEffect(() => {
    if (!isTimeIndexApplicable) {
      setCompareNumbersOfDataPointsForTime(false);
      setCompareValuesOfDataPointsForTime(false);
    }
  }, [isTimeIndexApplicable]);

  useEffect(() => {
    if (!performDeepLogComparison) {
      setSelectedCheckOption(CheckOptions.None);
      setCompareValuesOfDataPointsForDepth(false);
      setCompareValuesOfDataPointsForTime(false);
      setCompareNumbersOfDataPointsForDepth(false);
      setCompareNumbersOfDataPointsForTime(false);
      setDepthSamplingMode("all");
      setCustomDepthInterval("");
      setDepthStartIndex("");
      setDepthEndIndex("");
      setTimeSamplingMode("all");
      setCustomTimeInterval("");
      setTimeStartIndex("");
      setTimeEndIndex("");
    }
  }, [performDeepLogComparison]);

  const isDepthChecked = useMemo(() => {
    return (
      performDeepLogComparison &&
      ((selectedCheckOption ===
        CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
        compareNumbersOfDataPointsForDepth) ||
        (selectedCheckOption ===
          CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
          compareValuesOfDataPointsForDepth))
    );
  }, [
    performDeepLogComparison,
    selectedCheckOption,
    compareNumbersOfDataPointsForDepth,
    compareValuesOfDataPointsForDepth
  ]);

  const isTimeChecked = useMemo(() => {
    return (
      performDeepLogComparison &&
      ((selectedCheckOption ===
        CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
        compareNumbersOfDataPointsForTime) ||
        (selectedCheckOption ===
          CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
          compareValuesOfDataPointsForTime))
    );
  }, [
    performDeepLogComparison,
    selectedCheckOption,
    compareNumbersOfDataPointsForTime,
    compareValuesOfDataPointsForTime
  ]);

  const onSubmit = async () => {
    setIsLoading(true);
    setFetchError("");
    const targetWellbore = await WellboreService.getWellbore(
      wellUid,
      wellboreUid,
      null,
      targetServer
    );

    try {
      const sourceWellboreReference: WellboreReference = {
        wellUid: selectedWellbore.wellUid,
        wellboreUid: selectedWellbore.uid,
        wellboreName: selectedWellbore.name,
        wellName: selectedWellbore.wellName
      };
      const targetWellboreReference: WellboreReference = {
        wellUid: targetWellbore.wellUid,
        wellboreUid: targetWellbore.uid,
        wellboreName: targetWellbore.name,
        wellName: targetWellbore.wellName
      };
      dispatchOperation({ type: OperationType.HideModal });
      const hasChildObjectsSelected =
        compareAllObjects || selectedObjectTypes.length > 0;
      const isLogsSelected =
        compareAllObjects || selectedObjectTypes.includes(EntityType.Log);
      const depthIntervalVal =
        depthSamplingMode === "custom"
          ? parseFloat(customDepthInterval) || undefined
          : depthSamplingMode !== "all"
          ? parseFloat(depthSamplingMode) || undefined
          : undefined;

      const timeIntervalVal =
        timeSamplingMode === "custom"
          ? parseFloat(customTimeInterval) || undefined
          : timeSamplingMode !== "all"
          ? parseFloat(timeSamplingMode) || undefined
          : undefined;

      const job: WellboreSubObjectsComparisonJob = {
        sourceWellbore: sourceWellboreReference,
        targetWellbore: targetWellboreReference,
        compareWellboreMetadata,
        compareAllObjects,
        objectTypesToCompare: compareAllObjects
          ? undefined
          : selectedObjectTypes,
        deepCompareObjects: hasChildObjectsSelected
          ? deepCompareObjects
          : false,
        matchByNameIfUidDiffers: hasChildObjectsSelected
          ? matchByNameIfUidDiffers
          : false,
        logMappings:
          isLogsSelected && logMappings.length > 0 ? logMappings : undefined,
        omitCustomData,
        omitTimestamps,
        decimalMode:
          decimalMode === DecimalComparisonMode.AppSettings &&
          decimals === DecimalPreference.Raw
            ? DecimalComparisonMode.Raw
            : decimalMode,
        customDecimalPlaces:
          decimalMode === DecimalComparisonMode.Custom
            ? customDecimalPlaces
            : decimalMode === DecimalComparisonMode.AppSettings &&
              decimals !== DecimalPreference.Raw
            ? parseInt(decimals as unknown as string, 10)
            : undefined,
        timezoneMode,
        timezone: timeZone,
        reportAllMismatches,
        compareDepthLogs: isLogsSelected ? compareDepthLogs : false,
        compareTimeLogs: isLogsSelected ? compareTimeLogs : false,
        specificLogUidsOrNames:
          isLogsSelected && specificLogFilter.trim().length > 0
            ? specificLogFilter
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : undefined,
        specificMnemonics:
          isLogsSelected && specificMnemonicFilter.trim().length > 0
            ? specificMnemonicFilter
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : undefined,
        countLogsData:
          isLogsSelected &&
          performDeepLogComparison &&
          selectedCheckOption ===
            CheckOptions.CompareNumberOfDataPointsPerMnemonic,
        checkLogsData:
          isLogsSelected &&
          performDeepLogComparison &&
          selectedCheckOption ===
            CheckOptions.CompareValuesOfDataPointsPerMnemonic,
        checkTimeBasedLogsData:
          isLogsSelected &&
          ((selectedCheckOption ===
            CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
            compareNumbersOfDataPointsForTime) ||
            (selectedCheckOption ===
              CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
              compareValuesOfDataPointsForTime)),
        checkDepthBasedLogsData:
          isLogsSelected &&
          ((selectedCheckOption ===
            CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
            compareNumbersOfDataPointsForDepth) ||
            (selectedCheckOption ===
              CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
              compareValuesOfDataPointsForDepth)),
        depthInterval:
          isLogsSelected && isDepthChecked ? depthIntervalVal : undefined,
        depthStartIndex:
          isLogsSelected && isDepthChecked && depthStartIndex.trim().length > 0
            ? depthStartIndex.trim()
            : undefined,
        depthEndIndex:
          isLogsSelected && isDepthChecked && depthEndIndex.trim().length > 0
            ? depthEndIndex.trim()
            : undefined,
        timeIntervalSeconds:
          isLogsSelected && isTimeChecked ? timeIntervalVal : undefined,
        timeStartIndex:
          isLogsSelected && isTimeChecked && timeStartIndex.trim().length > 0
            ? timeStartIndex.trim()
            : undefined,
        timeEndIndex:
          isLogsSelected && isTimeChecked && timeEndIndex.trim().length > 0
            ? timeEndIndex.trim()
            : undefined
      };
      const jobId = await JobService.orderJobAtServer(
        JobType.WellboreSubObjectsComparison,
        job,
        connectedServer,
        targetServer
      );
      if (jobId) {
        const reportModalProps = { jobId };
        dispatchOperation({
          type: OperationType.DisplayModal,
          payload: <ReportModal {...reportModalProps} />
        });
      }
    } catch (e) {
      console.error(e);
      const message = !targetWellbore
        ? "Target wellbore not found"
        : "Failed to fetch";
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    if (
      invalidUid(wellUid) ||
      invalidUid(wellboreUid) ||
      targetServer == null
    ) {
      return true;
    }
    if (
      !compareWellboreMetadata &&
      !compareAllObjects &&
      selectedObjectTypes.length === 0
    ) {
      return true;
    }
    const isLogsSelected =
      compareAllObjects || selectedObjectTypes.includes(EntityType.Log);
    if (isLogsSelected && !compareDepthLogs && !compareTimeLogs) {
      return true;
    }
    if (
      decimalMode === DecimalComparisonMode.Custom &&
      (customDecimalPlaces < 0 ||
        customDecimalPlaces > 10 ||
        isNaN(customDecimalPlaces))
    ) {
      return true;
    }
    return (
      (performDeepLogComparison && selectedCheckOption === CheckOptions.None) ||
      (performDeepLogComparison &&
        selectedCheckOption ===
          CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
        !compareNumbersOfDataPointsForDepth &&
        !compareNumbersOfDataPointsForTime) ||
      (performDeepLogComparison &&
        selectedCheckOption ===
          CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
        !compareValuesOfDataPointsForDepth &&
        !compareValuesOfDataPointsForTime)
    );
  };

  return (
    <ModalDialog
      heading="Compare wellbore with"
      onSubmit={onSubmit}
      confirmColor="primary"
      confirmDisabled={validate()}
      confirmText="OK"
      showCancelButton={true}
      width={ModalWidth.LARGE}
      isLoading={isLoading}
      errorMessage={fetchError}
      content={
        <ModalContentLayout>
          <TargetInfoContainer colors={colors}>
            <Typography variant="body_short" bold>
              Source (Current Server: {connectedServer?.name}):
            </Typography>
            <Typography variant="caption">
              Well: {selectedWellbore.wellName} ({selectedWellbore.wellUid}) |
              Wellbore: {selectedWellbore.name} ({selectedWellbore.uid})
            </Typography>
          </TargetInfoContainer>

          <Autocomplete
            id="server"
            label="Target server to compare against"
            options={filteredServers}
            optionLabel={(server: Server) => server.name}
            onOptionsChange={({ selectedItems }) => {
              setTargetServer(selectedItems[0]);
            }}
            style={{
              paddingBottom: "16px"
            }}
          />
          <TextField
            id="welluid"
            label="Target Well UID"
            value={wellUid}
            variant={invalidUid(wellUid) ? "error" : undefined}
            helperText={
              invalidUid(wellUid)
                ? `Well UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(wellUid) ? 0 : "16px"
            }}
          />
          <TextField
            id="wellboreuid"
            label="Target Wellbore UID"
            value={wellboreUid}
            variant={invalidUid(wellboreUid) ? "error" : undefined}
            helperText={
              invalidUid(wellboreUid)
                ? `Wellbore UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellboreUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(wellboreUid) ? 0 : "16px"
            }}
          />

          <ButtonsContainer>
            <Button onClick={onClear}>Clear</Button>
            <Button onClick={onReset}>Reset</Button>
            <Button
              onClick={onPaste}
              disabled={wellboreWithMixedObjectsReference == null}
            >
              Paste
            </Button>
          </ButtonsContainer>

          <StyledAccordion>
            {/* Section 1: Sub-Object Scope */}
            <Accordion.Item isExpanded>
              <StyledAccordionHeader colors={colors}>
                1. Wellbore &amp; Child Objects Scope &amp; Matching
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{
                  backgroundColor: colors.ui.backgroundLight,
                  padding: "1rem"
                }}
              >
                <Checkbox
                  label="Compare wellbore metadata (all WITSML 1.4.1.1 wellbore header elements, depths, datums &amp; properties)"
                  checked={compareWellboreMetadata}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCompareWellboreMetadata(e.target.checked)
                  }
                  colors={colors}
                />
                <Checkbox
                  label="Compare all available child objects"
                  checked={compareAllObjects}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCompareAllObjects(e.target.checked)
                  }
                  colors={colors}
                />
                <Typography
                  variant="caption"
                  style={{
                    marginLeft: "2rem",
                    marginTop: "-4px",
                    marginBottom: "8px",
                    display: "block",
                    color: colors.text.staticIconsTertiary
                  }}
                >
                  {compareAllObjects
                    ? "Uncheck to customize or select specific object types (e.g. Tubular, MudLog, Trajectory, Log)."
                    : "Select which object types to include in the comparison below:"}
                </Typography>
                {!compareAllObjects && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                        marginBottom: "0.5rem"
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setSelectedObjectTypes(
                            AVAILABLE_SUB_OBJECTS.map((o) => o.type)
                          )
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedObjectTypes([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <SubObjectsGrid>
                      {AVAILABLE_SUB_OBJECTS.map((item) => (
                        <Checkbox
                          key={item.type}
                          label={item.label}
                          checked={selectedObjectTypes.includes(item.type)}
                          onChange={() => toggleObjectType(item.type)}
                          colors={colors}
                        />
                      ))}
                    </SubObjectsGrid>
                  </>
                )}
                <div style={{ marginTop: "0.5rem" }}>
                  <Checkbox
                    label="Deep object comparison (deeply compare all child object elements, properties &amp; sorted child records)"
                    checked={
                      (compareAllObjects || selectedObjectTypes.length > 0) &&
                      deepCompareObjects
                    }
                    disabled={
                      !compareAllObjects && selectedObjectTypes.length === 0
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setDeepCompareObjects(e.target.checked)
                    }
                    colors={colors}
                  />
                  <Checkbox
                    label="Match by Name if UID differs (fallback when child object UIDs do not match between servers)"
                    checked={
                      (compareAllObjects || selectedObjectTypes.length > 0) &&
                      matchByNameIfUidDiffers
                    }
                    disabled={
                      !compareAllObjects && selectedObjectTypes.length === 0
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMatchByNameIfUidDiffers(e.target.checked)
                    }
                    colors={colors}
                  />
                </div>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Section 2: Metadata & Precision Normalization */}
            <Accordion.Item isExpanded>
              <StyledAccordionHeader colors={colors}>
                2. Deep Comparison Rules &amp; Normalization
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{
                  backgroundColor: colors.ui.backgroundLight,
                  padding: "1rem"
                }}
              >
                <Checkbox
                  label="Omit server-specific customData elements (e.g. server tags &amp; custom timestamps)"
                  checked={omitCustomData}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOmitCustomData(e.target.checked)
                  }
                  colors={colors}
                />
                <Checkbox
                  label="Omit audit / creation timestamps (dTimCreation, dTimLastChange)"
                  checked={omitTimestamps}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOmitTimestamps(e.target.checked)
                  }
                  colors={colors}
                />
                <Checkbox
                  label="Report all mismatches (unlimited report items &amp; downloadable CSV export)"
                  checked={reportAllMismatches}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setReportAllMismatches(e.target.checked)
                  }
                  colors={colors}
                />

                <FormRow style={{ marginTop: "1rem" }}>
                  <StyledNativeSelect
                    label="Decimal Comparison Mode"
                    id="decimal-comparison-mode"
                    colors={colors}
                    value={decimalMode}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setDecimalMode(e.target.value as DecimalComparisonMode)
                    }
                  >
                    <option value={DecimalComparisonMode.ServerSettings}>
                      Server Settings (Tolerance based on server capabilities)
                    </option>
                    <option value={DecimalComparisonMode.AppSettings}>
                      App Settings (Follows application decimal preference)
                    </option>
                    <option value={DecimalComparisonMode.Custom}>
                      Custom Decimal Places
                    </option>
                    <option value={DecimalComparisonMode.Raw}>
                      Raw (Compare using available decimal places without any
                      adjustment)
                    </option>
                  </StyledNativeSelect>

                  {decimalMode === DecimalComparisonMode.Custom && (
                    <TextField
                      id="custom-decimals"
                      label="Decimal Places (0-10)"
                      type="number"
                      value={customDecimalPlaces.toString()}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCustomDecimalPlaces(parseInt(e.target.value, 10))
                      }
                      style={{ width: "160px" }}
                    />
                  )}
                </FormRow>

                <FormRow style={{ marginTop: "1rem" }}>
                  <StyledNativeSelect
                    label="Timezone Normalization Mode"
                    id="timezone-comparison-mode"
                    colors={colors}
                    value={timezoneMode}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setTimezoneMode(e.target.value as TimezoneComparisonMode)
                    }
                  >
                    <option value={TimezoneComparisonMode.Utc}>
                      UTC (Normalize all datetimes to UTC before comparing)
                    </option>
                    <option value={TimezoneComparisonMode.AppSettings}>
                      App Settings Timezone ({timeZone})
                    </option>
                    <option value={TimezoneComparisonMode.Raw}>
                      Raw (Exact datetime offset &amp; string comparison)
                    </option>
                  </StyledNativeSelect>
                </FormRow>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Section 3: Log Comparison & QA/QC Options (Optional) */}
            {(compareAllObjects ||
              selectedObjectTypes.includes(EntityType.Log)) && (
              <Accordion.Item>
                <StyledAccordionHeader colors={colors}>
                  3. Log Comparison &amp; QA/QC Options (Optional)
                </StyledAccordionHeader>
                <Accordion.Panel
                  style={{
                    backgroundColor: colors.ui.backgroundLight,
                    padding: "1rem"
                  }}
                >
                  {/* Top Action Bar: Fetch Available Logs from Servers */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: colors.ui.backgroundDefault,
                      border: `1px solid ${colors.interactive.disabledBorder}`,
                      borderRadius: "4px",
                      padding: "0.75rem 1rem",
                      marginBottom: "1rem",
                      gap: "1rem"
                    }}
                  >
                    <div>
                      <Typography variant="body_short" bold>
                        Fetch Available Logs from Servers
                      </Typography>
                      <Typography
                        variant="caption"
                        style={{ color: colors.text.staticIconsTertiary }}
                      >
                        {sourceLogs.length > 0 || targetLogs.length > 0
                          ? `✓ Loaded ${sourceLogs.length} log(s) from ${
                              connectedServer?.name ?? "Source"
                            } and ${targetLogs.length} log(s) from ${
                              targetServer?.name ?? "Target"
                            }.`
                          : "Load logs to enable interactive log and mnemonic selection, curve details, and explicit log mapping."}
                      </Typography>
                    </div>
                    <Button
                      onClick={loadLogs}
                      disabled={
                        !targetServer ||
                        invalidUid(wellUid) ||
                        invalidUid(wellboreUid) ||
                        isLoadingLogs
                      }
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {isLoadingLogs
                        ? "Loading Logs..."
                        : sourceLogs.length > 0 || targetLogs.length > 0
                        ? "Reload Logs from Servers"
                        : "Load Available Logs from Servers"}
                    </Button>
                  </div>

                  {/* 3A: Log Indexes & Curve Targeting */}
                  <Typography
                    variant="body_short"
                    bold
                    style={{ marginBottom: "0.5rem" }}
                  >
                    Log Indexes &amp; Curve Targeting:
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      marginBottom: "0.75rem"
                    }}
                  >
                    <Checkbox
                      label="Depth logs (MD)"
                      checked={compareDepthLogs}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCompareDepthLogs(e.target.checked)
                      }
                      colors={colors}
                    />
                    <Checkbox
                      label="Time logs (Date time)"
                      checked={compareTimeLogs}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCompareTimeLogs(e.target.checked)
                      }
                      colors={colors}
                    />
                  </div>

                  {!compareDepthLogs && !compareTimeLogs ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        marginBottom: "1.25rem",
                        backgroundColor: colors.ui.backgroundDefault,
                        border: `1px solid ${colors.interactive.warningResting}`,
                        borderRadius: "4px",
                        gap: "1rem"
                      }}
                    >
                      <div>
                        <Typography
                          variant="body_short"
                          bold
                          style={{ color: colors.interactive.warningResting }}
                        >
                          No log index type selected
                        </Typography>
                        <Typography
                          variant="caption"
                          style={{ color: colors.text.staticIconsTertiary }}
                        >
                          Please select Depth logs (MD) and/or Time logs (Date
                          time) above to compare logs.
                        </Typography>
                      </div>
                      <Button
                        onClick={() => {
                          setCompareDepthLogs(true);
                          setCompareTimeLogs(true);
                        }}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Select Both Indexes
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Compare specific log(s) */}
                      <div style={{ marginBottom: "0.75rem" }}>
                        {availableLogOptions.length > 0 && !isManualLogInput ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "4px"
                              }}
                            >
                              <Typography
                                variant="caption"
                                style={{
                                  color: colors.text.staticIconsTertiary
                                }}
                              >
                                {availableLogOptions.length} log(s) available
                                across servers
                              </Typography>
                              <Button
                                variant="outlined"
                                style={{
                                  height: "26px",
                                  fontSize: "0.75rem",
                                  padding: "0 8px"
                                }}
                                onClick={() => setIsManualLogInput(true)}
                              >
                                <Icon
                                  name="edit"
                                  size={16}
                                  style={{ marginRight: "4px" }}
                                />
                                Enter log names manually
                              </Button>
                            </div>
                            <Autocomplete
                              id="specific-log-select"
                              label="Compare specific log(s) (optional)"
                              placeholder="Select logs to compare..."
                              options={availableLogOptions}
                              multiple
                              selectedOptions={selectedLogOptions}
                              optionLabel={(l: AvailableLogOption) =>
                                `${l.name} (${l.uid})`
                              }
                              optionComponent={(l: AvailableLogOption) => (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    padding: "2px 0"
                                  }}
                                >
                                  <div>
                                    <Typography variant="body_short" bold>
                                      {l.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      style={{
                                        color: colors.text.staticIconsTertiary
                                      }}
                                    >
                                      UID: {l.uid}{" "}
                                      {l.indexType ? `• ${l.indexType}` : ""}
                                    </Typography>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      backgroundColor:
                                        colors.ui.backgroundLight,
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      border: `1px solid ${colors.interactive.disabledBorder}`,
                                      color: colors.text.staticIconsTertiary
                                    }}
                                  >
                                    {l.serverPresence}
                                  </span>
                                </div>
                              )}
                              onOptionsChange={({ selectedItems }) =>
                                handleLogSelectionChange(selectedItems)
                              }
                              helperText="Select one or more logs. Leave empty to compare all logs matching selected index types."
                            />
                            {selectedLogOptions.length > 0 && (
                              <div style={{ marginTop: "0.5rem" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "4px"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    style={{
                                      fontWeight: "bold",
                                      color: colors.text.staticIconsDefault
                                    }}
                                  >
                                    Selected Log
                                    {selectedLogOptions.length > 1 ? "s" : ""} (
                                    {selectedLogOptions.length}):
                                  </Typography>
                                  {selectedLogOptions.length > 1 && (
                                    <Button
                                      variant="outlined"
                                      style={{
                                        height: "24px",
                                        fontSize: "0.75rem",
                                        padding: "0 8px"
                                      }}
                                      onClick={() => {
                                        setSelectedLogOptions([]);
                                        setSpecificLogFilter("");
                                      }}
                                    >
                                      <Icon
                                        name="clear"
                                        size={16}
                                        style={{ marginRight: "4px" }}
                                      />
                                      Clear all logs
                                    </Button>
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px"
                                  }}
                                >
                                  {selectedLogOptions.map((log) => (
                                    <Chip
                                      key={log.uid}
                                      onDelete={() => {
                                        const updated =
                                          selectedLogOptions.filter(
                                            (l) => l.uid !== log.uid
                                          );
                                        setSelectedLogOptions(updated);
                                        setSpecificLogFilter(
                                          updated
                                            .map((l) => l.name || l.uid)
                                            .join(", ")
                                        );
                                      }}
                                    >
                                      <span>{log.name}</span>
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {availableLogOptions.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  marginBottom: "4px"
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  style={{
                                    height: "26px",
                                    fontSize: "0.75rem",
                                    padding: "0 8px"
                                  }}
                                  onClick={switchToLogDropdown}
                                >
                                  <Icon
                                    name="viewList"
                                    size={16}
                                    style={{ marginRight: "4px" }}
                                  />
                                  Switch to dropdown picker
                                </Button>
                              </div>
                            )}
                            <TextField
                              id="specific-log-filter"
                              label="Compare specific log(s) (optional)"
                              placeholder="e.g. Surface_Depth (comma-separated for multiple)"
                              value={specificLogFilter}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setSpecificLogFilter(e.target.value)
                              }
                              helperText={
                                availableLogOptions.length > 0
                                  ? "Enter log name(s) or UID(s) separated by commas, or switch to dropdown picker above."
                                  : "Tip: Load available logs above to choose from a dropdown list with curve details."
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* Compare specific mnemonic(s) */}
                      <div style={{ marginBottom: "1.25rem" }}>
                        {isLoadingCurves && (
                          <Typography
                            variant="caption"
                            style={{
                              color: colors.interactive.primaryResting,
                              display: "block",
                              marginBottom: "4px"
                            }}
                          >
                            Loading curve definitions for selected log(s)...
                          </Typography>
                        )}
                        {availableMnemonics.length > 0 &&
                        !isManualMnemonicInput ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "4px"
                              }}
                            >
                              <Typography
                                variant="caption"
                                style={{
                                  color: colors.text.staticIconsTertiary
                                }}
                              >
                                {availableMnemonics.length} curve
                                {availableMnemonics.length > 1 ? "s" : ""}{" "}
                                available across {selectedLogOptions.length}{" "}
                                selected log
                                {selectedLogOptions.length > 1 ? "s" : ""}
                              </Typography>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <Button
                                  variant="outlined"
                                  style={{
                                    height: "26px",
                                    fontSize: "0.75rem",
                                    padding: "0 8px"
                                  }}
                                  onClick={handleSelectAllMnemonics}
                                >
                                  <Icon
                                    name="check"
                                    size={16}
                                    style={{ marginRight: "4px" }}
                                  />
                                  Select All
                                </Button>
                                <Button
                                  variant="outlined"
                                  style={{
                                    height: "26px",
                                    fontSize: "0.75rem",
                                    padding: "0 8px"
                                  }}
                                  onClick={handleClearAllMnemonics}
                                >
                                  <Icon
                                    name="clear"
                                    size={16}
                                    style={{ marginRight: "4px" }}
                                  />
                                  Clear
                                </Button>
                                <Button
                                  variant="outlined"
                                  style={{
                                    height: "26px",
                                    fontSize: "0.75rem",
                                    padding: "0 8px"
                                  }}
                                  onClick={() => setIsManualMnemonicInput(true)}
                                >
                                  <Icon
                                    name="edit"
                                    size={16}
                                    style={{ marginRight: "4px" }}
                                  />
                                  Manual entry
                                </Button>
                              </div>
                            </div>
                            <Autocomplete
                              id="specific-mnemonic-select"
                              label="Compare specific mnemonic(s) (optional)"
                              placeholder="Search and select mnemonics..."
                              options={availableMnemonics}
                              multiple
                              selectedOptions={selectedMnemonicOptions}
                              optionLabel={(m: MnemonicOption) =>
                                `${m.mnemonic} (${m.logName})`
                              }
                              optionComponent={(m: MnemonicOption) => (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    padding: "3px 0"
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: "8px"
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                      }}
                                    >
                                      <Typography variant="body_short" bold>
                                        {m.mnemonic}
                                      </Typography>
                                      {m.unit && (
                                        <span
                                          style={{
                                            fontSize: "0.7rem",
                                            backgroundColor:
                                              colors.ui.backgroundLight,
                                            padding: "0.5px 5px",
                                            borderRadius: "3px",
                                            border: `1px solid ${colors.interactive.disabledBorder}`
                                          }}
                                        >
                                          {m.unit}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      style={{
                                        fontSize: "0.7rem",
                                        color: colors.text.staticIconsTertiary,
                                        backgroundColor:
                                          colors.ui.backgroundLight,
                                        padding: "0.5px 5px",
                                        borderRadius: "3px"
                                      }}
                                    >
                                      Log: <b>{m.logName}</b>
                                    </span>
                                  </div>
                                  {m.curveDescription && (
                                    <Typography
                                      variant="caption"
                                      style={{
                                        color: colors.text.staticIconsTertiary,
                                        fontSize: "0.7rem",
                                        whiteSpace: "normal",
                                        marginTop: "2px"
                                      }}
                                    >
                                      {m.curveDescription}
                                    </Typography>
                                  )}
                                </div>
                              )}
                              onOptionsChange={({ selectedItems }) =>
                                handleMnemonicChange(selectedItems)
                              }
                              helperText="Mnemonics are grouped by their parent log with units and descriptions. Selected curves will be targeted in comparison."
                            />
                            {selectedCurveBadges.length > 0 && (
                              <div style={{ marginTop: "0.5rem" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "4px"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    style={{
                                      fontWeight: "bold",
                                      color: colors.text.staticIconsDefault
                                    }}
                                  >
                                    Selected Curve
                                    {selectedMnemonicOptions.length > 1
                                      ? "s"
                                      : ""}{" "}
                                    ({selectedMnemonicOptions.length}):
                                  </Typography>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.5rem",
                                      alignItems: "center"
                                    }}
                                  >
                                    {selectedCurveBadges.length > 6 && (
                                      <Button
                                        variant="outlined"
                                        style={{
                                          height: "24px",
                                          fontSize: "0.75rem",
                                          padding: "0 8px"
                                        }}
                                        onClick={() =>
                                          setIsCurvesExpanded(!isCurvesExpanded)
                                        }
                                      >
                                        <Icon
                                          name={
                                            isCurvesExpanded
                                              ? "collapse"
                                              : "expand"
                                          }
                                          size={16}
                                          style={{ marginRight: "4px" }}
                                        />
                                        {isCurvesExpanded
                                          ? "Collapse"
                                          : "Show all"}
                                      </Button>
                                    )}
                                    <Button
                                      variant="outlined"
                                      style={{
                                        height: "24px",
                                        fontSize: "0.75rem",
                                        padding: "0 8px"
                                      }}
                                      onClick={handleClearAllMnemonics}
                                    >
                                      <Icon
                                        name="clear"
                                        size={16}
                                        style={{ marginRight: "4px" }}
                                      />
                                      Clear all
                                    </Button>
                                  </div>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    maxHeight: isCurvesExpanded
                                      ? "100px"
                                      : "none",
                                    overflowY: isCurvesExpanded
                                      ? "auto"
                                      : "visible",
                                    padding: isCurvesExpanded ? "4px" : "0",
                                    border: isCurvesExpanded
                                      ? `1px solid ${colors.interactive.disabledBorder}`
                                      : "none",
                                    borderRadius: "4px"
                                  }}
                                >
                                  {(isCurvesExpanded
                                    ? selectedCurveBadges
                                    : selectedCurveBadges.slice(0, 6)
                                  ).map((badge) => {
                                    if (
                                      badge.type === "summary" &&
                                      badge.logUid
                                    ) {
                                      return (
                                        <Chip
                                          key={badge.key}
                                          variant="active"
                                          onDelete={() => {
                                            handleMnemonicChange(
                                              selectedMnemonicOptions.filter(
                                                (m) => m.logUid !== badge.logUid
                                              )
                                            );
                                          }}
                                        >
                                          <span>{badge.label}</span>
                                        </Chip>
                                      );
                                    }
                                    return (
                                      <Chip
                                        key={badge.key}
                                        onDelete={() => {
                                          handleMnemonicChange(
                                            selectedMnemonicOptions.filter(
                                              (m) => m.key !== badge.curveKey
                                            )
                                          );
                                        }}
                                      >
                                        <span>
                                          {badge.label}
                                          {badge.subLabel && (
                                            <span
                                              style={{
                                                fontSize: "0.65rem",
                                                color:
                                                  colors.text
                                                    .staticIconsTertiary,
                                                marginLeft: "4px"
                                              }}
                                            >
                                              ({badge.subLabel})
                                            </span>
                                          )}
                                        </span>
                                      </Chip>
                                    );
                                  })}

                                  {!isCurvesExpanded &&
                                    selectedCurveBadges.length > 6 && (
                                      <Chip
                                        variant="default"
                                        onClick={() =>
                                          setIsCurvesExpanded(true)
                                        }
                                        style={{
                                          cursor: "pointer",
                                          fontStyle: "italic"
                                        }}
                                      >
                                        <span>
                                          + {selectedCurveBadges.length - 6}{" "}
                                          more...
                                        </span>
                                      </Chip>
                                    )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {availableMnemonics.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  marginBottom: "4px"
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  style={{
                                    height: "26px",
                                    fontSize: "0.75rem",
                                    padding: "0 8px"
                                  }}
                                  onClick={switchToMnemonicDropdown}
                                >
                                  <Icon
                                    name="viewList"
                                    size={16}
                                    style={{ marginRight: "4px" }}
                                  />
                                  Switch to curve dropdown
                                </Button>
                              </div>
                            )}
                            <TextField
                              id="specific-mnemonic-filter"
                              label="Compare specific mnemonic(s) (optional)"
                              placeholder="e.g. ROP, GR, HKLD (comma-separated for multiple)"
                              value={specificMnemonicFilter}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setSpecificMnemonicFilter(e.target.value)
                              }
                              helperText={
                                selectedLogOptions.length === 0 &&
                                (sourceLogs.length > 0 || targetLogs.length > 0)
                                  ? "Tip: Select one or more logs above to browse and pick mnemonics by log, or enter mnemonic names manually."
                                  : "Leave empty to compare all mnemonics, or enter mnemonic name(s) to only compare those."
                              }
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 3B: Explicit Log Mapping */}
                  <div
                    style={{
                      borderTop: `1px solid ${colors.interactive.disabledBorder}`,
                      paddingTop: "1rem",
                      marginBottom: "1.25rem"
                    }}
                  >
                    <Typography
                      variant="body_short"
                      bold
                      style={{ marginBottom: "0.25rem" }}
                    >
                      Explicit Log Mapping (Optional):
                    </Typography>
                    <Typography
                      variant="caption"
                      style={{
                        marginBottom: "0.75rem",
                        display: "block",
                        color: colors.text.staticIconsTertiary
                      }}
                    >
                      Pair specific logs between Server A and Server B (e.g.
                      compare <code>Surface_TimeA</code> with{" "}
                      <code>Surface_TimeB</code>).
                      {sourceLogs.length > 0 || targetLogs.length > 0
                        ? " Select from the loaded logs below or enter UIDs manually."
                        : ' Click "Load Available Logs from Servers" above to select from dropdowns, or enter UIDs manually below.'}
                    </Typography>

                    <FormRow>
                      {sourceLogs.length > 0 ? (
                        <div style={{ flex: 1 }}>
                          <Autocomplete
                            id="source-log-select"
                            label={`Source Log (${
                              connectedServer?.name ?? "Server A"
                            })`}
                            options={sourceLogs}
                            optionLabel={(l: LogObject) =>
                              `${l.name} (${l.uid})`
                            }
                            onOptionsChange={({ selectedItems }) =>
                              setSelectedSourceLog(selectedItems[0] ?? null)
                            }
                          />
                        </div>
                      ) : (
                        <TextField
                          id="source-log-uid"
                          label={`Source Log UID / Name (${
                            connectedServer?.name ?? "Server A"
                          })`}
                          placeholder="e.g. Surface_TimeA"
                          value={manualSourceLogUid}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setManualSourceLogUid(e.target.value)
                          }
                          style={{ flex: 1 }}
                        />
                      )}

                      {targetLogs.length > 0 ? (
                        <div style={{ flex: 1 }}>
                          <Autocomplete
                            id="target-log-select"
                            label={`Target Log (${
                              targetServer?.name ?? "Server B"
                            })`}
                            options={targetLogs}
                            optionLabel={(l: LogObject) =>
                              `${l.name} (${l.uid})`
                            }
                            onOptionsChange={({ selectedItems }) =>
                              setSelectedTargetLog(selectedItems[0] ?? null)
                            }
                          />
                        </div>
                      ) : (
                        <TextField
                          id="target-log-uid"
                          label={`Target Log UID / Name (${
                            targetServer?.name ?? "Server B"
                          })`}
                          placeholder="e.g. Surface_TimeB"
                          value={manualTargetLogUid}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setManualTargetLogUid(e.target.value)
                          }
                          style={{ flex: 1 }}
                        />
                      )}

                      <Button
                        style={{ alignSelf: "flex-end", marginBottom: "4px" }}
                        onClick={addLogMapping}
                        disabled={
                          (!selectedSourceLog && !manualSourceLogUid.trim()) ||
                          (!selectedTargetLog && !manualTargetLogUid.trim())
                        }
                      >
                        + Add Pair
                      </Button>
                    </FormRow>

                    {logMappings.length > 0 && (
                      <LogMappingsList>
                        <Typography variant="body_short" bold>
                          Configured Log Mappings ({logMappings.length}):
                        </Typography>
                        {logMappings.map((mapping, idx) => (
                          <LogMappingRow key={idx} colors={colors}>
                            <Typography variant="body_short">
                              <b>Source:</b>{" "}
                              {mapping.sourceLogName ?? mapping.sourceLogUid} (
                              {mapping.sourceLogUid}) &rarr; <b>Target:</b>{" "}
                              {mapping.targetLogName ?? mapping.targetLogUid} (
                              {mapping.targetLogUid})
                            </Typography>
                            <Button
                              variant="ghost_icon"
                              onClick={() => removeLogMapping(idx)}
                            >
                              <Icon name="deleteToTrash" />
                            </Button>
                          </LogMappingRow>
                        ))}
                      </LogMappingsList>
                    )}
                  </div>

                  {/* 3C: Deep Log Curve Data QA/QC */}
                  <div
                    style={{
                      borderTop: `1px solid ${colors.interactive.disabledBorder}`,
                      paddingTop: "1rem"
                    }}
                  >
                    <Typography
                      variant="body_short"
                      bold
                      style={{ marginBottom: "0.5rem" }}
                    >
                      Deep Log Curve Data QA/QC (Rows &amp; Values) (Optional):
                    </Typography>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: performDeepLogComparison
                          ? "1fr 1.35fr"
                          : "1fr",
                        gap: "1.5rem",
                        alignItems: "start"
                      }}
                    >
                      {/* Left Column: Scope & Checks */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                          borderRight: performDeepLogComparison
                            ? `1px solid ${colors.interactive.disabledBorder}`
                            : "none",
                          paddingRight: performDeepLogComparison
                            ? "1.25rem"
                            : "0"
                        }}
                      >
                        <Checkbox
                          label="Perform deep log curve data QA/QC comparison"
                          checked={performDeepLogComparison}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setPerformDeepLogComparison(e.target.checked);
                            if (!e.target.checked) {
                              setSelectedCheckOption(CheckOptions.None);
                              setCompareValuesOfDataPointsForDepth(false);
                              setCompareValuesOfDataPointsForTime(false);
                              setCompareNumbersOfDataPointsForDepth(false);
                              setCompareNumbersOfDataPointsForTime(false);
                            }
                          }}
                          colors={colors}
                        />
                        <label style={alignLayout}>
                          <Radio
                            name="group"
                            disabled={!performDeepLogComparison}
                            checked={
                              performDeepLogComparison &&
                              selectedCheckOption ===
                                CheckOptions.CompareNumberOfDataPointsPerMnemonic
                            }
                            onChange={() => {
                              setSelectedCheckOption(
                                CheckOptions.CompareNumberOfDataPointsPerMnemonic
                              );
                              setCompareValuesOfDataPointsForDepth(false);
                              setCompareValuesOfDataPointsForTime(false);
                              if (
                                isDepthIndexApplicable &&
                                !isTimeIndexApplicable
                              ) {
                                setCompareNumbersOfDataPointsForDepth(true);
                                setCompareNumbersOfDataPointsForTime(false);
                              } else if (
                                !isDepthIndexApplicable &&
                                isTimeIndexApplicable
                              ) {
                                setCompareNumbersOfDataPointsForDepth(false);
                                setCompareNumbersOfDataPointsForTime(true);
                              }
                            }}
                          />
                          <Typography>
                            Compare number of data points per mnemonic
                          </Typography>
                        </label>
                        <Checkbox
                          style={checkboxStyle}
                          label="Check depth index"
                          checked={compareNumbersOfDataPointsForDepth}
                          disabled={
                            !performDeepLogComparison ||
                            selectedCheckOption !==
                              CheckOptions.CompareNumberOfDataPointsPerMnemonic ||
                            !isDepthIndexApplicable
                          }
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setCompareNumbersOfDataPointsForDepth(
                              e.target.checked
                            );
                          }}
                          colors={colors}
                        />
                        <Checkbox
                          style={checkboxStyle}
                          label="Check time index"
                          disabled={
                            !performDeepLogComparison ||
                            selectedCheckOption !==
                              CheckOptions.CompareNumberOfDataPointsPerMnemonic ||
                            !isTimeIndexApplicable
                          }
                          checked={compareNumbersOfDataPointsForTime}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setCompareNumbersOfDataPointsForTime(
                              e.target.checked
                            );
                          }}
                          colors={colors}
                        />
                        <label style={alignLayout}>
                          <Radio
                            name="group"
                            disabled={!performDeepLogComparison}
                            checked={
                              performDeepLogComparison &&
                              selectedCheckOption ===
                                CheckOptions.CompareValuesOfDataPointsPerMnemonic
                            }
                            onChange={() => {
                              setSelectedCheckOption(
                                CheckOptions.CompareValuesOfDataPointsPerMnemonic
                              );
                              setCompareNumbersOfDataPointsForDepth(false);
                              setCompareNumbersOfDataPointsForTime(false);
                              if (
                                isDepthIndexApplicable &&
                                !isTimeIndexApplicable
                              ) {
                                setCompareValuesOfDataPointsForDepth(true);
                                setCompareValuesOfDataPointsForTime(false);
                              } else if (
                                !isDepthIndexApplicable &&
                                isTimeIndexApplicable
                              ) {
                                setCompareValuesOfDataPointsForDepth(false);
                                setCompareValuesOfDataPointsForTime(true);
                              }
                            }}
                          />
                          <Typography>
                            Compare values of data points per mnemonic
                          </Typography>
                        </label>

                        <Checkbox
                          style={checkboxStyle}
                          label="Check depth index"
                          disabled={
                            !performDeepLogComparison ||
                            selectedCheckOption !==
                              CheckOptions.CompareValuesOfDataPointsPerMnemonic ||
                            !isDepthIndexApplicable
                          }
                          checked={compareValuesOfDataPointsForDepth}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setCompareValuesOfDataPointsForDepth(
                              e.target.checked
                            );
                          }}
                          colors={colors}
                        />
                        <Checkbox
                          style={checkboxStyle}
                          label="Check time index"
                          disabled={
                            !performDeepLogComparison ||
                            selectedCheckOption !==
                              CheckOptions.CompareValuesOfDataPointsPerMnemonic ||
                            !isTimeIndexApplicable
                          }
                          checked={compareValuesOfDataPointsForTime}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setCompareValuesOfDataPointsForTime(
                              e.target.checked
                            );
                          }}
                          colors={colors}
                        />
                        {(compareNumbersOfDataPointsForTime ||
                          compareValuesOfDataPointsForTime) &&
                          performDeepLogComparison && (
                            <div style={{ marginTop: "0.5rem" }}>
                              <WarningBar message="Deep comparison of time logs could be time consuming." />
                            </div>
                          )}
                      </div>

                      {/* Right Column: Contextual Sampling & Range Drawer */}
                      {performDeepLogComparison && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                          }}
                        >
                          {!isDepthChecked && !isTimeChecked && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "2.5rem 1.5rem",
                                border: `1px dashed ${colors.interactive.disabledBorder}`,
                                borderRadius: "6px",
                                backgroundColor: colors.ui.backgroundDefault,
                                textAlign: "center",
                                gap: "0.5rem",
                                minHeight: "180px"
                              }}
                            >
                              <Icon
                                name="tune"
                                size={28}
                                style={{
                                  color: colors.text.staticIconsTertiary
                                }}
                              />
                              <Typography
                                variant="caption"
                                style={{
                                  color: colors.text.staticIconsTertiary,
                                  maxWidth: "260px"
                                }}
                              >
                                Select <strong>Check depth index</strong> or{" "}
                                <strong>Check time index</strong> to configure
                                sampling intervals and range filters.
                              </Typography>
                            </div>
                          )}

                          {isDepthChecked && (
                            <SamplingDrawerCard colors={colors}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  borderBottom: `1px solid ${colors.interactive.disabledBorder}`,
                                  paddingBottom: "0.5rem"
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor:
                                        colors.interactive.primaryResting
                                    }}
                                  />
                                  <Typography
                                    variant="body_short"
                                    bold
                                    style={{
                                      fontSize: "0.85rem",
                                      color: colors.text.staticIconsDefault
                                    }}
                                  >
                                    DEPTH SAMPLING &amp; RANGE (MD)
                                  </Typography>
                                </div>
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: colors.text.staticIconsTertiary
                                  }}
                                >
                                  Applies to depth comparison
                                </Typography>
                              </div>

                              <div>
                                <Typography
                                  variant="caption"
                                  style={{
                                    fontWeight: "bold",
                                    color: colors.text.staticIconsTertiary,
                                    marginBottom: "0.4rem",
                                    display: "block"
                                  }}
                                >
                                  Sampling Interval:
                                </Typography>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.35rem",
                                    alignItems: "center"
                                  }}
                                >
                                  {[
                                    { label: "All (Raw)", value: "all" },
                                    { label: "0.5m", value: "0.5" },
                                    { label: "1m", value: "1" },
                                    { label: "5m", value: "5" },
                                    { label: "10m", value: "10" },
                                    { label: "Custom", value: "custom" }
                                  ].map((preset) => (
                                    <Button
                                      key={preset.value}
                                      variant={
                                        depthSamplingMode === preset.value
                                          ? "contained"
                                          : "outlined"
                                      }
                                      style={{
                                        minWidth: "auto",
                                        padding: "2px 8px",
                                        height: "26px",
                                        fontSize: "0.75rem"
                                      }}
                                      onClick={() =>
                                        setDepthSamplingMode(preset.value)
                                      }
                                    >
                                      {preset.label}
                                    </Button>
                                  ))}
                                  {depthSamplingMode === "custom" && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                        marginLeft: "0.25rem"
                                      }}
                                    >
                                      <TextField
                                        id="custom-depth-step"
                                        placeholder="Step"
                                        value={customDepthInterval}
                                        onChange={(
                                          e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                          setCustomDepthInterval(e.target.value)
                                        }
                                        style={{
                                          width: "70px",
                                          height: "26px"
                                        }}
                                      />
                                      <Typography variant="caption">
                                        m
                                      </Typography>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  borderTop: `1px solid ${colors.interactive.disabledBorder}`,
                                  paddingTop: "0.5rem"
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.4rem"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    style={{
                                      fontWeight: "bold",
                                      color: colors.text.staticIconsTertiary
                                    }}
                                  >
                                    Depth Range Filter (Optional):
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    style={{
                                      color: colors.text.staticIconsTertiary,
                                      fontSize: "0.7rem"
                                    }}
                                  >
                                    Leave blank for full log
                                  </Typography>
                                </div>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0.5rem"
                                  }}
                                >
                                  <TextField
                                    id="depth-start-index"
                                    label="Start Depth (MD)"
                                    placeholder="e.g. 1500"
                                    value={depthStartIndex}
                                    onChange={(
                                      e: ChangeEvent<HTMLInputElement>
                                    ) => setDepthStartIndex(e.target.value)}
                                  />
                                  <TextField
                                    id="depth-end-index"
                                    label="End Depth (MD)"
                                    placeholder="e.g. 2500"
                                    value={depthEndIndex}
                                    onChange={(
                                      e: ChangeEvent<HTMLInputElement>
                                    ) => setDepthEndIndex(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  marginTop: "0.25rem"
                                }}
                              >
                                <Icon
                                  name="infoCircle"
                                  size={16}
                                  style={{
                                    color: colors.interactive.primaryResting,
                                    flexShrink: 0
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: colors.text.staticIconsTertiary,
                                    fontSize: "0.75rem"
                                  }}
                                >
                                  Filters WITSML queries to the specified depth
                                  range and steps points at the chosen interval.
                                </Typography>
                              </div>
                            </SamplingDrawerCard>
                          )}

                          {isTimeChecked && (
                            <SamplingDrawerCard colors={colors}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  borderBottom: `1px solid ${colors.interactive.disabledBorder}`,
                                  paddingBottom: "0.5rem"
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor:
                                        colors.interactive.primaryResting
                                    }}
                                  />
                                  <Typography
                                    variant="body_short"
                                    bold
                                    style={{
                                      fontSize: "0.85rem",
                                      color: colors.text.staticIconsDefault
                                    }}
                                  >
                                    TIME SAMPLING &amp; RANGE
                                  </Typography>
                                </div>
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: colors.text.staticIconsTertiary
                                  }}
                                >
                                  Applies to time comparison
                                </Typography>
                              </div>

                              <div>
                                <Typography
                                  variant="caption"
                                  style={{
                                    fontWeight: "bold",
                                    color: colors.text.staticIconsTertiary,
                                    marginBottom: "0.4rem",
                                    display: "block"
                                  }}
                                >
                                  Sampling Interval:
                                </Typography>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.35rem",
                                    alignItems: "center"
                                  }}
                                >
                                  {[
                                    { label: "All (Raw)", value: "all" },
                                    { label: "5s", value: "5" },
                                    { label: "30s", value: "30" },
                                    { label: "1m", value: "60" },
                                    { label: "5m", value: "300" },
                                    { label: "Custom", value: "custom" }
                                  ].map((preset) => (
                                    <Button
                                      key={preset.value}
                                      variant={
                                        timeSamplingMode === preset.value
                                          ? "contained"
                                          : "outlined"
                                      }
                                      style={{
                                        minWidth: "auto",
                                        padding: "2px 8px",
                                        height: "26px",
                                        fontSize: "0.75rem"
                                      }}
                                      onClick={() =>
                                        setTimeSamplingMode(preset.value)
                                      }
                                    >
                                      {preset.label}
                                    </Button>
                                  ))}
                                  {timeSamplingMode === "custom" && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                        marginLeft: "0.25rem"
                                      }}
                                    >
                                      <TextField
                                        id="custom-time-step"
                                        placeholder="Sec"
                                        value={customTimeInterval}
                                        onChange={(
                                          e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                          setCustomTimeInterval(e.target.value)
                                        }
                                        style={{
                                          width: "70px",
                                          height: "26px"
                                        }}
                                      />
                                      <Typography variant="caption">
                                        s
                                      </Typography>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  borderTop: `1px solid ${colors.interactive.disabledBorder}`,
                                  paddingTop: "0.5rem"
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.4rem"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    style={{
                                      fontWeight: "bold",
                                      color: colors.text.staticIconsTertiary
                                    }}
                                  >
                                    Time Range Filter (Optional):
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    style={{
                                      color: colors.text.staticIconsTertiary,
                                      fontSize: "0.7rem"
                                    }}
                                  >
                                    Leave blank for full log
                                  </Typography>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.35rem",
                                    marginBottom: "0.5rem"
                                  }}
                                >
                                  {[
                                    { label: "Last hour", ms: 3600 * 1000 },
                                    {
                                      label: "Last 6 hours",
                                      ms: 6 * 3600 * 1000
                                    },
                                    { label: "Last day", ms: 24 * 3600 * 1000 },
                                    {
                                      label: "Last week",
                                      ms: 7 * 24 * 3600 * 1000
                                    }
                                  ].map((preset) => (
                                    <Button
                                      key={preset.label}
                                      variant="outlined"
                                      style={{
                                        minWidth: "auto",
                                        padding: "1px 6px",
                                        height: "24px",
                                        fontSize: "0.7rem"
                                      }}
                                      onClick={() => {
                                        const end =
                                          timeEndIndex &&
                                          !isNaN(Date.parse(timeEndIndex))
                                            ? new Date(timeEndIndex)
                                            : new Date();
                                        const start = new Date(
                                          end.getTime() - preset.ms
                                        );
                                        setTimeStartIndex(start.toISOString());
                                        setTimeEndIndex(end.toISOString());
                                      }}
                                    >
                                      {preset.label}
                                    </Button>
                                  ))}
                                  <Button
                                    variant="outlined"
                                    style={{
                                      minWidth: "auto",
                                      padding: "1px 6px",
                                      height: "24px",
                                      fontSize: "0.7rem",
                                      color: colors.text.staticIconsTertiary
                                    }}
                                    disabled={!timeStartIndex && !timeEndIndex}
                                    onClick={() => {
                                      setTimeStartIndex("");
                                      setTimeEndIndex("");
                                    }}
                                  >
                                    Clear
                                  </Button>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem"
                                  }}
                                >
                                  <TimePickerWrapper>
                                    <LogHeaderDateTimeField
                                      value={timeStartIndex}
                                      label="Start Time"
                                      updateObject={(dateTime: string) =>
                                        setTimeStartIndex(dateTime ?? "")
                                      }
                                      maxValue={
                                        timeStartIndex && timeEndIndex
                                          ? timeEndIndex
                                          : undefined
                                      }
                                    />
                                  </TimePickerWrapper>
                                  <TimePickerWrapper>
                                    <LogHeaderDateTimeField
                                      value={timeEndIndex}
                                      label="End Time"
                                      updateObject={(dateTime: string) =>
                                        setTimeEndIndex(dateTime ?? "")
                                      }
                                      minValue={
                                        timeStartIndex && timeEndIndex
                                          ? timeStartIndex
                                          : undefined
                                      }
                                    />
                                  </TimePickerWrapper>
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  marginTop: "0.25rem"
                                }}
                              >
                                <Icon
                                  name="infoCircle"
                                  size={16}
                                  style={{
                                    color: colors.interactive.primaryResting,
                                    flexShrink: 0
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  style={{
                                    color: colors.text.staticIconsTertiary,
                                    fontSize: "0.75rem"
                                  }}
                                >
                                  Decimates high-frequency time rows into
                                  interval steps to prevent query timeouts.
                                </Typography>
                              </div>
                            </SamplingDrawerCard>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            )}
          </StyledAccordion>
        </ModalContentLayout>
      }
    />
  );
};

const TargetInfoContainer = styled.div<{ colors: any }>`
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: ${(props) => props.colors.ui.backgroundLight};
  border-left: 4px solid ${(props) => props.colors.interactive.primaryResting};
  border-radius: 4px;
`;

const SubObjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-left: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const LogMappingsList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LogMappingRow = styled.div<{ colors: any }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  border: 1px solid ${(props) => props.colors.interactive.disabledBorder};
  border-radius: 4px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding-left: 0.5rem;
  padding-bottom: 1rem;
`;

const SamplingDrawerCard = styled.div<{ colors: any }>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  border: 1px solid ${(props) => props.colors.interactive.disabledBorder};
  border-radius: 6px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TimePickerWrapper = styled.div`
  width: 100%;
  > div > div {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: flex-start;
    width: 100%;
    > div:last-child {
      flex: 1;
      width: 100%;
    }
  }
`;

const alignLayout: CSSProperties = {
  display: "flex",
  alignItems: "center",
  paddingLeft: "24px"
};

const checkboxStyle: CSSProperties = {
  paddingLeft: "48px"
};

const invalidUid = (uid: string) => {
  return uid == null || uid.length == 0 || uid.length > MaxLength.Uid;
};

export default WellborePickerModal;
