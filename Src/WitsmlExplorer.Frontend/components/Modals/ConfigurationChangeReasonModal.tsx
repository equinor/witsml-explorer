import { Divider } from "@equinor/eds-core-react";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { ReadOnlyPropertiesGrid } from "components/ReadOnlyProperties/ReadOnlyPropertiesGrid";
import { ReadOnlyPropertiesRendererProperty } from "components/ReadOnlyProperties/ReadOnlyPropertiesRenderer";
import { ReadOnlyProperty } from "components/ReadOnlyProperties/ReadOnlyProperty";
import { useOperationState } from "hooks/useOperationState";
import DataSourceConfiguration from "models/dataWorkOrder/dataSourceConfiguration";
import React from "react";
import styled from "styled-components";

export interface ConfigurationChangeReasonModalProps {
  dataSourceConfiguration: DataSourceConfiguration;
}

export const ConfigurationChangeReasonModal = (
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
          />
          <Divider
            style={{
              margin: "0px",
              backgroundColor: colors.interactive.disabledBorder
            }}
          />
          <HorizontalLayout>
            <div
              style={{
                backgroundColor: colors.ui.backgroundLight,
                padding: "1rem",
                borderRadius: "4px"
              }}
            >
              <ul>
                <li>
                  <ReadOnlyProperty
                    label={`${changeReason?.channelsAdded?.length} Added`}
                    value={changeReason?.channelsAdded?.join(", ")}
                  />
                </li>
                <li>
                  <ReadOnlyProperty
                    label={`${changeReason?.channelsModified?.length} Modified`}
                    value={changeReason?.channelsModified?.join(", ")}
                  />
                </li>
                <li>
                  <ReadOnlyProperty
                    label={`${changeReason?.channelsRemoved?.length} Removed`}
                    value={changeReason?.channelsRemoved?.join(", ")}
                  />
                </li>
                <li>
                  <ReadOnlyProperty label="Changed data requirements" />
                </li>
              </ul>
            </div>
            <ReadOnlyPropertiesGrid
              properties={changeProperties}
              object={changeReason}
              columns={1}
            />
          </HorizontalLayout>
        </VerticalLayout>
      }
    />
  );
};

const VerticalLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HorizontalLayout = styled.div`
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 1rem;
  width: 100%;
`;

const configurationProperties: ReadOnlyPropertiesRendererProperty[] = [
  {
    property: "name",
    propertyType: PropertyType.String
  },
  {
    property: "status",
    propertyType: PropertyType.String
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
    propertyType: PropertyType.String
  },
  {
    property: "timeStatus",
    propertyType: PropertyType.String
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
