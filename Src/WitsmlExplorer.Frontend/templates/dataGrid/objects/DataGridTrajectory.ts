import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefWellboreTrajectoryProperties } from "templates/dataGrid/objects/common/properties/DataGridRefWellboreTrajectoryProperties";
import { dataGridTrajectoryStationProperties } from "templates/dataGrid/objects/common/properties/DataGridTrajectoryStationProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridTrajectory: DataGridProperty = {
  name: "trajectorys",
  documentation: "",
  isContainer: true,
  properties: [
    {
      name: "xmlns",
      documentation: "",
      isAttribute: true
    },
    {
      name: "version",
      documentation: "",
      isAttribute: true
    },
    {
      name: "trajectory",
      documentation: "A single trajectory.",
      isMultiple: true,
      isContainer: true,
      properties: [
        {
          name: "uidWell",
          documentation:
            "Unique identifier for the well. This uniquely represents the well referenced by the (possibly non-unique) nameWell.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          documentation:
            "Unique identifier for the wellbore. This uniquely represents the wellbore referenced by the (possibly non-unique) nameWellbore.",
          isAttribute: true
        },
        {
          name: "uid",
          documentation: "Unique identifier for the trajectory.",
          isAttribute: true
        },
        {
          name: "nameWell",
          documentation:
            "Human recognizable context for the well that contains the wellbore."
        },
        {
          name: "nameWellbore",
          documentation:
            "Human recognizable context for the wellbore that contains the trajectory."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the trajectory."
        },
        {
          name: "objectGrowing",
          documentation:
            'The growing state of the object. This value is only relevant within the context of a server. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the behavior related to this element.'
        },
        {
          name: "parentTrajectory",
          documentation:
            "If a trajectory is tied into another trajectory, a pointer to the parent trajectory. The trajectory may be in another wellbore.",
          isContainer: true,
          properties: dataGridRefWellboreTrajectoryProperties
        },
        {
          name: "dTimTrajStart",
          documentation:
            "Start date and time of trajectory station measurements. Note that this is NOT a server query parameter."
        },
        {
          name: "dTimTrajEnd",
          documentation:
            "End date and time of trajectory station measurements. Note that this is NOT a server query parameter."
        },
        {
          name: "mdMn",
          documentation:
            'Minimum measured depth of this object. This is an API "structural-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdMx",
          documentation:
            'Maximum measured depth of this object. This is an API "structural-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "serviceCompany",
          documentation: "Name of contractor who provided the service."
        },
        {
          name: "magDeclUsed",
          documentation:
            "Magnetic declination used to correct a Magnetic North referenced azimuth to a True North azimuth. Magnetic declination angles are measured positive clockwise from True North to Magnetic North (or negative in the anti-clockwise direction). To convert a Magnetic azimuth to a True North azimuth, the magnetic declination should be added. Starting value if stations have individual values. ",
          properties: dataGridUomProperties
        },
        {
          name: "gridCorUsed",
          documentation:
            "DEPRECATED - use gridConUsed. Grid correction used to correct a survey. Starting value if stations have individual values.",
          properties: dataGridUomProperties
        },
        {
          name: "gridConUsed",
          documentation:
            "Magnetic declination used to correct a Magnetic North referenced azimuth to a True North azimuth. Magnetic declination angles are measured positive clockwise from True North to Magnetic North (or negative in the anti-clockwise direction). To convert a Magnetic azimuth to a True North azimuth, the magnetic declination should be added. Starting value if stations have individual values.",
          properties: dataGridUomProperties
        },
        {
          name: "aziVertSect",
          documentation: "Azimuth used for vertical section plot/computations.",
          properties: dataGridUomProperties
        },
        {
          name: "dispNsVertSectOrig",
          documentation:
            "Origin north-south used for vertical section plot/computations.",
          properties: dataGridUomProperties
        },
        {
          name: "dispEwVertSectOrig",
          documentation:
            "Origin east-west used for vertical section plot/computations.",
          properties: dataGridUomProperties
        },
        {
          name: "definitive",
          documentation:
            'True ("true" or "1") indicates that this trajectory is definitive for this wellbore. False ("false" or "0") or not given indicates otherwise. There can only be one trajectory per wellbore with definitive=true and it must define the geometry of the whole wellbore (surface to bottom). The definitive trajectory may represent a composite of information in many other trajectories. A query requesting a subset of the possible information can provide a simplistic view of the geometry of the wellbore.'
        },
        {
          name: "memory",
          documentation:
            'Is trajectory a result of a memory dump from a tool? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "finalTraj",
          documentation:
            'Is trajectory a final or intermediate/preliminary? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "aziRef",
          documentation:
            "Specifies the definition of north. While this is optional because of legacy data, it is strongly recommended that this always be specified."
        },
        {
          name: "trajectoryStation",
          documentation:
            'Container element for trajectory station elements. This is an API "data-node" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
          isContainer: true,
          isMultiple: true,
          properties: dataGridTrajectoryStationProperties
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
