import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridShortNameStructProperties } from "templates/dataGrid/objects/common/properties/DataGridNameStructProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridLog: DataGridProperty = {
  name: "logs",
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
      name: "log",
      documentation: "A single log.",
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
          documentation: "Unique identifier for the log.",
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
            "Human recognizable context for the wellbore that contains the log."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the log."
        },
        {
          name: "objectGrowing",
          documentation:
            'The growing state of the object. This value is only relevant within the context of a server. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the behavior related to this element.'
        },
        {
          name: "dataUpateRate",
          documentation:
            'The data append rate (in seconds) of this growing object. This is an API server parameter releted to the "Special Handling Systematically Growing Objects" within a server. See the relevant API specification for the behavior related to this element.'
        },
        {
          name: "curveSensorsAligned",
          documentation:
            'This value is only relevant within the context of a server. True ("true" or "1") indicates that all curves have the same sensor offset from the downhole equipment vertical reference. False ("false" or "0") or not given indicates otherwise. For a growing log, a value of true will allow a query to use the the endIndex from the previous query as the startIndex of the next query.'
        },
        {
          name: "dataGroup",
          documentation:
            "The name of the grouping represented by curves in this log. A group represents a named combination of curves and the curves in a particular log should be represented in that list."
        },
        {
          name: "serviceCompany",
          documentation: "Name of contractor who provided the service."
        },
        {
          name: "runNumber",
          documentation:
            "Log run number. This should normally be a number; however some legacy systems encode other information in this value."
        },
        {
          name: "bhaRunNumber",
          documentation:
            "The bottom hole assembly run number associated with this log. This should match the run number on the BHA run object."
        },
        {
          name: "pass",
          documentation: "Identifies the pass within the run."
        },
        {
          name: "creationDate",
          documentation: "Date and time that the log was created."
        },
        {
          name: "description",
          documentation: "Description of item and details."
        },
        {
          name: "dataDelimiter",
          documentation:
            "The value delimiter in the data string. Defaults to a comma. Note that this does not affect any space delimited array data."
        },
        {
          name: "indexType",
          documentation: "Primary index type."
        },
        {
          name: "startIndex",
          documentation:
            'When the log header defines the direction as "Increasing", the startIndex is the starting (minimum) index value at which the first non-null data point is located. When the log header defines the direction as "Decreasing", the startIndex is the starting (maximum) index value at which the first non-null data point is located. Either a quantity index set (start and end) or a date time index set must be given. If both sets are given then "indexType" and "indexCurve" must represent an elapsed time from "startDateTimeIndex". This is an API "structural-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
          properties: dataGridUomProperties
        },
        {
          name: "endIndex",
          documentation:
            'When the log header defines the direction as "Increasing", the endIndex is the ending (maximum) index value at which the last non-null data point is located. When the log header defines the direction as Decreasing, the endIndex is the ending (minimum) index value at which the last non-null data point is located. This is an API "structural-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
          properties: dataGridUomProperties
        },
        {
          name: "stepIncrement",
          documentation:
            "The sampling increment. Set to zero for unequal sampling. A non-zero value indicates that the data is regularly sampled even if it has an explicit index curve. If it is zero or not given then assume that it is non-regular even though it may be regular. The problem is that writers generally cannot guarantee the regularity of the log until after they have finished processing it For curves that are originally sampled at a constant increment, this value should be retained because calculated values may have cumulative errors.",
          properties: [
            {
              name: "uom",
              documentation:
                'The unit of measure for the quantity. If for some reason a uom is not appropriate for the quantity, a unit of "Euc" should be used.',
              isAttribute: true
            },
            {
              name: "numerator",
              documentation: "",
              isAttribute: true
            },
            {
              name: "denominator",
              documentation: "",
              isAttribute: true
            }
          ]
        },
        {
          name: "startDateTimeIndex",
          documentation:
            'When the log header defines the direction as "Increasing", the startIndex is the starting (minimum) index value at which the first non-null data point is located. When the log header defines the direction as "Decreasing", the startIndex is the starting (maximum) index value at which the first non-null data point is located. Either a quantity index set (start and end) or a date time index set must be given. If both sets are given then "indexType" and "indexCurve" must represent an elapsed time from "startDateTimeIndex". This is an API "structural-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.'
        },
        {
          name: "endDateTimeIndex",
          documentation:
            'When the log header defines the direction as "Increasing", the endIndex is the ending (maximum) index value at which the last non-null data point is located. When the log header defines the direction as Decreasing, the endIndex is the ending (minimum) index value at which the last non-null data point is located. This is an API "structural-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.'
        },
        {
          name: "direction",
          documentation:
            'The sort order of the data row index values in the XML instance. For an "Increasing" direction the index value of consecutive data nodes are ascending. For a "Decreasing" direction the index value of consecutive data nodes are descending. The default direction is "Increasing". The direction of a log cannot be changed once it has been created. That is, this value cannot be updated in a server.'
        },
        {
          name: "indexCurve",
          documentation:
            'The mnemonic of the index curve. Duplicate index values can exist in a log but a change of direction is not allowed. If a change of direction is required then a new log must be created. Some servers may eliminate (i.e., overwrite) duplicate indexes. The data values associated with this curve represent an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.'
        },
        {
          name: "nullValue",
          documentation:
            "An empty string is the default representation of a null value for a curve (i.e. when the null value representation is not explicitly defined). If a null value representation is defined for a log, this becomes the default for all curves in that log (but can be overridden at the curve level). An empty string is always a valid null value representation in the comma delimited list. An empty string is not a valid null value representation within a space delimited array. Specifying a null value also makes it easier to transform data back to a legacy format without having to scan the data to insure that the null pattern does not exist in the data."
        },
        {
          name: "logParam",
          documentation:
            'Log parameters. For this usage the name attribute MUST be specified because it represents the meaning of the data. While the index attribute is mandatory, it is only significant if the same name repeats. A parameter name of "multipass" represents a boolean values ("true" or "false"). A "multipass" parameter value of "true" asserts that the object contains values for bhaRunNumber (or runNumber), passNumber and direction.',
          isMultiple: true,
          properties: [
            {
              name: "index",
              documentation:
                "Indexes things with the same name. That is the first one, the second one, etc.",
              isAttribute: true
            },
            {
              name: "name",
              documentation: "",
              isAttribute: true
            },
            {
              name: "uom",
              documentation: "",
              isAttribute: true
            },
            {
              name: "description",
              documentation: "",
              isAttribute: true
            },
            {
              name: "uid",
              documentation: "Unique identifier for the node.",
              isAttribute: true
            }
          ]
        },
        {
          name: "logCurveInfo",
          documentation:
            'Container element for the log curve information. This is an API "column-definition" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
          isContainer: true,
          isMultiple: true,
          properties: [
            {
              name: "uid",
              documentation:
                "Unique identifier for the curve. A suggested algorithm for creating the uid is to derive it from the mnemonic (e.g., converting blanks to underscores).",
              isAttribute: true
            },
            {
              name: "mnemonic",
              documentation:
                "The curve name. This must be unique for all curves in a log. The naming authority for the mnemonic can be catptured in the namingSystem attribute. Since both the mnemonic and uid have similar requirements within the context of a WITSML server, the uid can be derived from the mnemonic (e.g., by converting blank to underscore).",
              properties: dataGridShortNameStructProperties
            },
            {
              name: "classWitsml",
              documentation:
                "The curve classification obtained from a lookup in the vendors mnemonic catalog."
            },
            {
              name: "classIndex",
              documentation:
                "The count relative to (possibly) repeating values of classWitsml. This is used to indicate something like the first pump, second pump, etc."
            },
            {
              name: "unit",
              documentation: "Unit of measurement of the data values."
            },
            {
              name: "mnemAlias",
              documentation:
                "Name alias for this trace. The naming authority for the mnemonic can be catptured in the namingSystem attribute.",
              properties: dataGridShortNameStructProperties
            },
            {
              name: "nullValue",
              documentation:
                "An empty string is the default representation of a null value for a curve (i.e., when the null value representation is not explicitly defined). If a null value is defined in the logCurveInfo, it overrides any null value specified at the logHeader level. An empty string is always a valid null value representation in the comma delimited list. An empty string is not a valid null value representation within a space delimited array. Specifying a null value also makes it easier to transform data back to a legacy format without having to scan the data to insure that the null pattern does not exist in the data."
            },
            {
              name: "alternateIndex",
              documentation:
                "True (true or 1) if this curve is a candidate to be a primary index. False (false or 0) or not given, indicates otherwise. An index curve should monotonically change when sorted on its own values (i.e., no duplicates)."
            },
            {
              name: "wellDatum",
              documentation:
                "A pointer to the wellDatum that represents the values of this trace. This is only relevant for measured depths, vertical depths or elevations.",
              properties: dataGridRefNameStringProperties
            },
            {
              name: "minIndex",
              documentation:
                'The minimum index value of any valid data point in the curve. Null values are excluded from this determination. The value is the same regardless of the direction of the curve. This is an API "column-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
              properties: dataGridUomProperties
            },
            {
              name: "maxIndex",
              documentation:
                'The maximum index value of any valid data point in the curve. Null values are excluded from this determination. The value is the same regardless of the direction of the curve. This is an API "column-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
              properties: dataGridUomProperties
            },
            {
              name: "minDateTimeIndex",
              documentation:
                'The minimum index value of any valid data point in the curve. Null values are excluded from this determination. The value is the same regardless of the direction of the curve. This is an API "column-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.'
            },
            {
              name: "maxDateTimeIndex",
              documentation:
                'The maximum index value of any valid data point in the curve. Null values are excluded from this determination. The value is the same regardless of the direction of the curve. This is an API "column-range" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.'
            },
            {
              name: "curveDescription",
              documentation: "Description of the curve."
            },
            {
              name: "sensorOffset",
              documentation:
                "Offset of sensor from a downhole equipment vertical reference (the drill bit, for MWD logs; the tool zero reference for wireline logs). This element is only informative (log values are presented at actual depth, not requiring subtraction of an offset).",
              properties: dataGridUomProperties
            },
            {
              name: "dataSource",
              documentation: "Data source, could be tool name/id."
            },
            {
              name: "densData",
              documentation:
                "Data density of sample in samples per length unit.",
              properties: dataGridUomProperties
            },
            {
              name: "traceState",
              documentation: "State of trace data."
            },
            {
              name: "traceOrigin",
              documentation: "Origin of trace data."
            },
            {
              name: "typeLogData",
              documentation: "Log data type."
            },
            {
              name: "axisDefinition",
              documentation:
                "Indicates that the curve is an array curve (i.e., multi-valued samples), and provides meta data by which an axis of the array can be understood. A separate definition is required for each axis of an N-dimensional array.",
              isContainer: true,
              isMultiple: true,
              properties: [
                {
                  name: "uid",
                  documentation: "Unique identifier for the axis.",
                  isAttribute: true
                },
                {
                  name: "order",
                  documentation:
                    "The order of this axis. The order should begin with one and increment by one for each additional axis. The order indicates how fast the index of the axis varies in the serialized list of values. The index of an axis with an order of one varies the slowest. The index of an axis with an order of two varies the next slowest. And so on. This is the same ordering that is used in the C programming language. For example, the following array: [ x axis ]: z11 z12 z13 [ y axis ]: z21 z22 z23 | z31 z32 z33 | z41 z42 z43 may be encoded as follows: axisDefinition[order=1].name='x' axisDefinition[order=1].count='3' axisDefinition[order=2].name='y' axisDefinition[order=2].count='4' { z11 z21 z31 z41 z12 z22 z32 z42 z13 z23 z33 z43 } or alternatively: axisDefinition[order=1].name='y' axisDefinition[order=1].count='4' axisDefinition[order=2].name='x' axisDefinition[order=2].count='3' { z11 z12 z13 z21 z22 z23 z31 z32 z33 z41 z42 z43 } STORE UNIQUE KEY: When accessed via the Store Interface, the \"order\" must be unique."
                },
                {
                  name: "count",
                  documentation:
                    "The count of elements along this axis of the array."
                },
                {
                  name: "name",
                  documentation: "The name of the array axis."
                },
                {
                  name: "propertyType",
                  documentation:
                    "The property type by which the array axis is classified."
                },
                {
                  name: "uom",
                  documentation:
                    "A string representing the units of measure of the axis values."
                },
                {
                  name: "doubleValues",
                  documentation:
                    "The serialziation of the axis positions of an array as a whitespace-delimited list values of type xsd:double. If the length of this list is less than 'count' then the difference in the last two values represents the increment to be used to fill out the list. For example, the list '2 4' with count=4 represents the list '2 4 6 8'. Note: This has an underlying string type because .NET will not properly handle a \"list of double\"."
                },
                {
                  name: "stringValues",
                  documentation:
                    "The serialziation of the axis positions of an array as a whitespace-delimited list values of type xsd:String. Note: the serialization of string elements with embedded whitespace cannot be properly decoded."
                },
                dataGridExtensionNameValue
              ]
            },
            dataGridExtensionNameValue
          ]
        },
        {
          name: "logData",
          documentation:
            'Container for one or more "rows" of log data. The use of more than one logData node represents a sparse view of the actual data and is contrained for use in the WITSML API for adding and updating sparse data. Any other usage should utilize only one instance of logData.',
          isContainer: true,
          isMultiple: true,
          properties: [
            {
              name: "mnemonicList",
              documentation:
                'A comma delimited list of curve mnemonics. Each mnemonic should only occur once in the list. The order of the mnemonics defines the order of the delimited values in elements "unitList" and "data". If the index curve is specified then it must be first in the list. This is an API "column-identifier" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.'
            },
            {
              name: "unitList",
              documentation:
                'A comma delimited list of unit of measure acronyms that represent the values in "data". The units are in the same order as the mnemonics in element mnemonicList. Each unit value must match the value in the logCurveInfo structure for that curve. A null value (i.e., unitless as opposed to dimensionless) will be defined by adjacent commas.'
            },
            {
              name: "data",
              documentation:
                'The actual data corresponding to the curves defined in the "mnemonicList" element. Normally a comma delimited list of data values (see dataDelimiter) with one value for each curve on the log (e.g., "xxx,yyy, zzz"). For array curves, the value of the array curve will be a space delimited list of values that are contained within the commas that delimit the value for that curve (e.g., "xxx,aa bb cc,zzz"). This essentially represents one row of a table where the curve mnemonics represent the column headings. This is an API "data-node" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
              isMultiple: true
            }
          ]
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
