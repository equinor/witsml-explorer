import { Divider } from "@equinor/eds-core-react";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { ReadOnlyPropertiesGrid } from "components/ReadOnlyProperties/ReadOnlyPropertiesGrid";
import { ReadOnlyPropertiesRendererProperty } from "components/ReadOnlyProperties/ReadOnlyPropertiesRenderer";
import { useOperationState } from "hooks/useOperationState";
import DataSourceConfiguration from "models/dataWorkOrder/dataSourceConfiguration";
import React from "react";

import { SectionOrderStatus } from "../../../models/dataWorkOrder/sectionOrderStatus.ts";
import { OperationStatus } from "../../../models/dataWorkOrder/operationStatus.ts";
import { Typography } from "../../StyledComponents/Typography.tsx";
import { HorizontalLayout, VerticalLayout } from "./styles.ts";
import AffectedGroup, { ListLabel } from "./AffectedGroup";
import {
  OperationStatusChip,
  SectionOrderStatusChip
} from "../../ContentViews/DataWorkOrder/StatusChips";

export interface ConfigurationChangeReasonModalProps {
  dataSourceConfiguration: DataSourceConfiguration;
}

const ConfigurationChangeReasonModal = (
  props: ConfigurationChangeReasonModalProps
): React.ReactElement => {
  const { dataSourceConfiguration } = props;
  const {
    operationState: { colors }
  } = useOperationState();
  const changeReason = dataSourceConfiguration.changeReason;

  return (
    <ModalDialog
      width={ModalWidth.LARGE}
      heading="Configuration Change Reason"
      cancelText="Close"
      showConfirmButton={false}
      isLoading={false}
      onSubmit={() => {}}
      content={
        <VerticalLayout>
          <ReadOnlyPropertiesGrid
            properties={configurationProperties}
            object={dataSourceConfiguration}
            columns={3}
            noMargin
          />
          <Divider
            style={{
              margin: "0px",
              backgroundColor: colors.interactive.disabledBorder
            }}
          />
          <div>
            <Typography
              colors={colors}
              style={{ paddingBottom: "0.5rem", fontSize: "14px" }}
            >
              Affected channels
            </Typography>
            <HorizontalLayout>
              <div
                style={{
                  backgroundColor: colors.ui.backgroundLight,
                  borderRadius: "4px"
                }}
              >
                <ul>
                  <AffectedGroup
                    label={`${changeReason?.channelsAdded?.length} Added`}
                    color={colors.interactive.primaryResting}
                  >
                    {changeReason?.channelsAdded?.join(", ")}
                  </AffectedGroup>
                  <AffectedGroup
                    label={`${changeReason?.channelsModified?.length} Modified`}
                    color={colors.interactive.warningText}
                  >
                    {changeReason?.channelsModified?.join(", ")}
                  </AffectedGroup>
                  <AffectedGroup
                    label={`${changeReason?.channelsRemoved?.length} Removed`}
                    color={colors.interactive.dangerText}
                  >
                    {changeReason?.channelsRemoved?.join(", ")}
                  </AffectedGroup>
                  {changeReason.isChangedDataRequirements && (
                    <li>
                      <ListLabel>
                        Changed data requirements
                        (isChangeDataRequirements=true)
                      </ListLabel>
                    </li>
                  )}
                </ul>
              </div>
              <ReadOnlyPropertiesGrid
                properties={changeProperties}
                object={changeReason}
                columns={1}
              />
            </HorizontalLayout>
          </div>
        </VerticalLayout>
      }
    />
  );
};

export default ConfigurationChangeReasonModal;

const configurationProperties: ReadOnlyPropertiesRendererProperty[] = [
  {
    property: "name",
    propertyType: PropertyType.String
  },
  {
    property: "status",
    propertyType: PropertyType.String,
    renderProperty: (value) => (
      <SectionOrderStatusChip status={value as SectionOrderStatus} />
    )
  },
  {
    property: "uid",
    propertyType: PropertyType.String
  },
  {
    property: "versionNumber",
    propertyType: PropertyType.String
  },
  {
    property: "depthStatus",
    propertyType: PropertyType.String,
    renderProperty: (value) => (
      <OperationStatusChip status={value as OperationStatus} />
    )
  },
  {
    property: "timeStatus",
    propertyType: PropertyType.String,
    renderProperty: (value) => (
      <OperationStatusChip status={value as OperationStatus} />
    )
  }
];

const changeProperties: ReadOnlyPropertiesRendererProperty[] = [
  {
    property: "changedBy",
    propertyType: PropertyType.String
  },
  {
    property: "dTimChanged",
    propertyType: PropertyType.DateTime
  },
  {
    property: "comments",
    propertyType: PropertyType.String
  }
];
