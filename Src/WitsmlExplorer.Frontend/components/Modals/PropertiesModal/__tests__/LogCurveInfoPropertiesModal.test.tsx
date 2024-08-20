import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEdsCoreReact } from "__testUtils__/mocks/EDSMocks";
import {
  getAxisDefinition,
  getLogCurveInfo,
  renderWithContexts
} from "__testUtils__/testUtils";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getLogCurveInfoProperties } from "components/Modals/PropertiesModal/Properties/LogCurveInfoProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import LogCurveInfo from "models/logCurveInfo";
import { vi } from "vitest";

vi.mock("@equinor/eds-core-react", () => mockEdsCoreReact());

const simpleProps: PropertiesModalProps<LogCurveInfo> = {
  title: `Edit LogCurveInfo properties`,
  object: getLogCurveInfo(),
  properties: getLogCurveInfoProperties(PropertiesModalMode.Edit, false),
  onSubmit: () => {}
};

const propsWithAxisDefinition: PropertiesModalProps<LogCurveInfo> = {
  ...simpleProps,
  object: getLogCurveInfo({
    axisDefinitions: [getAxisDefinition()]
  })
};

describe("Tests for PropertiesModal for LogCurveInfo", () => {
  it("Properties of a LogCurve should be shown in the modal", async () => {
    const expectedLogCurveInfo = simpleProps.object;

    renderWithContexts(<PropertiesModal {...simpleProps} />);

    const uidInput = screen.getByRole("textbox", { name: /uid/i });
    const mnemonicInput = screen.getByRole("textbox", { name: /mnemonic/i });

    expect(uidInput).toHaveValue(expectedLogCurveInfo.uid);
    expect(mnemonicInput).toHaveValue(expectedLogCurveInfo.mnemonic);

    expect(uidInput).toBeDisabled();
    expect(mnemonicInput).toBeEnabled();
  });

  it("AxisDefinition should be shown disabled in the LogCurveInfo modal when included in the props", async () => {
    const expectedLogCurveInfo = propsWithAxisDefinition.object;
    const expectedAxisDefinition = expectedLogCurveInfo.axisDefinitions[0];

    renderWithContexts(<PropertiesModal {...propsWithAxisDefinition} />);

    const uidInput = screen.getByRole("textbox", { name: /uid/i });
    const mnemonicInput = screen.getByRole("textbox", { name: /mnemonic/i });
    const axisDefinitionLabel = screen.getByText(/axisdefinition/i);
    const orderInput = screen.getByRole("spinbutton", { name: /order/i });
    const countInput = screen.getByRole("spinbutton", { name: /count/i });
    const doubleValuesInput = screen.getByRole("textbox", {
      name: /doubleValues/i
    });

    expect(uidInput).toHaveValue(expectedLogCurveInfo.uid);
    expect(mnemonicInput).toHaveValue(expectedLogCurveInfo.mnemonic);
    expect(axisDefinitionLabel).toHaveTextContent(expectedAxisDefinition.uid);
    expect(orderInput).toHaveValue(expectedAxisDefinition.order);
    expect(countInput).toHaveValue(expectedAxisDefinition.count);
    expect(doubleValuesInput).toHaveValue(expectedAxisDefinition.doubleValues);

    expect(uidInput).toBeDisabled();
    expect(mnemonicInput).toBeEnabled();
    expect(orderInput).toBeDisabled();
    expect(countInput).toBeDisabled();
    expect(doubleValuesInput).toBeDisabled();
  });

  it("Saving edited properties of a LogCurve should call onSubmit with the changed parts of the object", async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    const props = {
      ...simpleProps,
      onSubmit: onSubmitMock
    };

    renderWithContexts(<PropertiesModal {...props} />);

    const mnemonicInput = screen.getByRole("textbox", { name: /mnemonic/i });
    const saveButton = screen.getByRole("button", { name: /save/i });

    await user.clear(mnemonicInput);
    await user.type(mnemonicInput, "editedMnemonic");

    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith({ mnemonic: "editedMnemonic" });
  });
});
