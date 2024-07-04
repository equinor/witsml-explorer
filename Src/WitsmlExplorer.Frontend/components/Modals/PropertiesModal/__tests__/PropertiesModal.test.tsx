import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEdsCoreReact } from "__testUtils__/mocks/EDSMocks";
import {
  MockResizeObserver,
  renderWithContexts
} from "__testUtils__/testUtils";
import {
  validBoolean,
  validMeasure,
  validOption,
  validPositiveInteger,
  validText
} from "components/Modals/ModalParts";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getBooleanHelperText,
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import MaxLength from "models/maxLength";
import Measure from "models/measure";
import { Mock, vi } from "vitest";

vi.mock("@equinor/eds-core-react", () => mockEdsCoreReact());

interface TestObject {
  stringProperty: string;
  numericStringProperty: string;
  numberProperty: number;
  measureProperty: Measure;
  optionsProperty: string;
  booleanProperty: boolean;
  listProperty: SubObject[];
}

interface SubObject {
  stringSubProperty: string;
}

const initialObject: TestObject = {
  stringProperty: "stringValue",
  numericStringProperty: "3",
  numberProperty: 5,
  measureProperty: {
    value: 3.2,
    uom: "m"
  },
  optionsProperty: "option 2",
  booleanProperty: false,
  listProperty: [
    {
      stringSubProperty: "subStringValue"
    }
  ]
};

const testOptions = ["option 1", "option 2", "option 3"];

const subProperties: PropertiesModalProperty<SubObject>[] = [
  {
    property: "stringSubProperty",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("stringSubProperty", MaxLength.Name)
  }
];

const testProperties: PropertiesModalProperty<TestObject>[] = [
  {
    property: "stringProperty",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("stringProperty", MaxLength.Name)
  },
  {
    property: "numericStringProperty",
    propertyType: PropertyType.StringNumber,
    validator: validPositiveInteger,
    helperText: "numericStringProperty must be a positive integer"
  },
  {
    property: "numberProperty",
    propertyType: PropertyType.Number,
    validator: validPositiveInteger,
    helperText: "numberProperty must be a positive integer"
  },
  {
    property: "measureProperty",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("measureProperty")
  },
  {
    property: "optionsProperty",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, testOptions),
    helperText: getOptionHelperText("optionsProperty"),
    options: testOptions
  },
  {
    property: "booleanProperty",
    propertyType: PropertyType.Boolean,
    validator: validBoolean,
    helperText: getBooleanHelperText("booleanProperty")
  },
  {
    property: "listProperty",
    propertyType: PropertyType.List,
    subProps: subProperties,
    itemPrefix: "ListItem "
  }
];

describe("Tests for PropertiesModal", () => {
  window.ResizeObserver = MockResizeObserver;
  let testProps: PropertiesModalProps<TestObject>;
  let onSubmitMock: Mock;

  beforeEach(() => {
    onSubmitMock = vi.fn();
    testProps = {
      title: `Edit TestObject properties`,
      object: initialObject,
      properties: testProperties,
      onSubmit: onSubmitMock
    };
  });

  it("Should show all properties", async () => {
    renderWithContexts(<PropertiesModal {...testProps} />);

    const stringInput = screen.getByRole("textbox", {
      name: /stringProperty/i
    });
    const numericStringInput = screen.getByRole("spinbutton", {
      name: /numericStringProperty/i
    });
    const numberInput = screen.getByRole("spinbutton", {
      name: /numberProperty/i
    });
    const measureValueInput = screen.getByRole("spinbutton", {
      name: /measureProperty/i
    });
    const measureUnitInput = screen.getByRole("textbox", { name: /unit/i });
    const optionsInput = screen.getByRole("combobox", {
      name: /optionsProperty/i
    });
    const booleanInput = screen.getByRole("combobox", {
      name: /booleanProperty/i
    });
    const listHeader = screen.getByText(/ListItem/i);
    const subStringInput = screen.getByRole("textbox", {
      name: /stringSubProperty/i
    });

    expect(stringInput).toHaveValue(initialObject.stringProperty);
    expect(stringInput).toBeEnabled();
    expect(numericStringInput).toHaveValue(
      parseInt(initialObject.numericStringProperty)
    );
    expect(numericStringInput).toBeEnabled();
    expect(numberInput).toHaveValue(initialObject.numberProperty);
    expect(numberInput).toBeEnabled();
    expect(measureValueInput).toHaveValue(initialObject.measureProperty.value);
    expect(measureValueInput).toBeEnabled();
    expect(measureUnitInput).toHaveValue(initialObject.measureProperty.uom);
    expect(measureUnitInput).toBeEnabled();
    expect(optionsInput).toHaveValue(initialObject.optionsProperty);
    expect(optionsInput).toBeEnabled();
    expect(booleanInput).toHaveValue(initialObject.booleanProperty.toString());
    expect(booleanInput).toBeEnabled();
    expect(listHeader).toBeInTheDocument();
    expect(subStringInput).toHaveValue(
      initialObject.listProperty[0].stringSubProperty
    );
    expect(subStringInput).toBeEnabled();
  });

  it("Should disable save when no values are changed", async () => {
    renderWithContexts(<PropertiesModal {...testProps} />);

    const saveButton = screen.getByRole("button", { name: /save/i });

    expect(saveButton).toBeDisabled();
  });

  it("Should enable save when a value is valid and changed", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = "newStringValue";

    const input = screen.getByRole("textbox", { name: /stringProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newValue);

    expect(input).toHaveValue(newValue);
    expect(saveButton).toBeEnabled();
  });

  it("Should disable save when all properties are reverted to their original value as no values are changed", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);

    const stringInput = screen.getByRole("textbox", {
      name: /stringProperty/i
    });
    const measureValueInput = screen.getByRole("spinbutton", {
      name: /measureProperty/i
    });
    const subStringInput = screen.getByRole("textbox", {
      name: /stringSubProperty/i
    });
    const saveButton = screen.getByRole("button", { name: /save/i });

    // Change the input fields
    await user.type(stringInput, "a");
    await user.type(measureValueInput, "5");
    await user.type(subStringInput, "b");

    // Revert changes
    await user.type(stringInput, "{backspace}");
    await user.type(measureValueInput, "{backspace}");
    await user.type(subStringInput, "{backspace}");

    expect(stringInput).toHaveValue(initialObject.stringProperty);
    expect(measureValueInput).toHaveValue(initialObject.measureProperty.value);
    expect(subStringInput).toHaveValue(
      initialObject.listProperty[0].stringSubProperty
    );
    expect(saveButton).toBeDisabled();
  });

  it("Clicking cancel should not call the callback", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = "newStringValue";

    const input = screen.getByRole("textbox", { name: /stringProperty/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.clear(input);
    await user.type(input, newValue);
    await user.click(cancelButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it("Saving edited string should call callback with the changed property", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = "newStringValue";

    const input = screen.getByRole("textbox", { name: /stringProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newValue);
    await user.click(saveButton);

    expect(onSubmitMock).toHaveBeenCalledOnce();
    expect(onSubmitMock).toHaveBeenCalledWith({ stringProperty: newValue });
  });

  it("Saving edited stringNumber should call callback with the changed number as a string", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = "9";

    const input = screen.getByRole("spinbutton", {
      name: /numericStringProperty/i
    });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newValue);
    await user.click(saveButton);

    expect(onSubmitMock).toHaveBeenCalledOnce();
    expect(onSubmitMock).toHaveBeenCalledWith({
      numericStringProperty: newValue
    });
  });

  it("Saving edited number should call callback with the changed number as a number", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = 9;

    const input = screen.getByRole("spinbutton", { name: /numberProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newValue.toString());
    await user.click(saveButton);

    expect(onSubmitMock).toHaveBeenCalledOnce();
    expect(onSubmitMock).toHaveBeenCalledWith({ numberProperty: newValue });
  });

  it("Saving edited boolean should call callback with the changed boolean", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = true;

    const input = screen.getByRole("combobox", { name: /booleanProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newValue.toString());
    await user.click(saveButton);

    expect(onSubmitMock).toHaveBeenCalledOnce();
    expect(onSubmitMock).toHaveBeenCalledWith({ booleanProperty: newValue });
  });

  it("Saving partially edited measure should call callback with the full measure", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newValue = 9.99;

    const input = screen.getByRole("spinbutton", { name: /measureProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newValue.toString());
    await user.click(saveButton);

    expect(onSubmitMock).toHaveBeenCalledOnce();
    expect(onSubmitMock).toHaveBeenCalledWith({
      measureProperty: {
        value: newValue,
        uom: initialObject.measureProperty.uom
      }
    });
  });

  it("Invalid edited string should give an error", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const newText = "editedInputWithTooLongText".repeat(10);
    const expectedHelperText = testProps.properties.find(
      (p) => p.property === "stringProperty"
    ).helperText;

    const input = screen.getByRole("textbox", { name: /stringProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, newText);
    const helperText = screen.getByText(expectedHelperText);

    expect(input).toHaveValue(newText);
    expect(helperText).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("Clearing the measure value should give an error", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const expectedHelperText = testProps.properties.find(
      (p) => p.property === "measureProperty"
    ).helperText;

    const input = screen.getByRole("spinbutton", { name: /measureProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    const helperText = screen.getByText(expectedHelperText);

    expect(helperText).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("Clearing the measure unit should give an error", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const expectedHelperText = testProps.properties.find(
      (p) => p.property === "measureProperty"
    ).helperText;

    const input = screen.getByRole("textbox", { name: /unit/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    const helperText = screen.getByText(expectedHelperText);

    expect(helperText).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("Invalid option should give an error", async () => {
    const user = userEvent.setup();
    renderWithContexts(<PropertiesModal {...testProps} />);
    const expectedHelperText = testProps.properties.find(
      (p) => p.property === "optionsProperty"
    ).helperText;

    const input = screen.getByRole("combobox", { name: /optionsProperty/i });
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.clear(input);
    await user.type(input, "option 4");
    const helperText = screen.getByText(expectedHelperText);

    expect(helperText).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});
