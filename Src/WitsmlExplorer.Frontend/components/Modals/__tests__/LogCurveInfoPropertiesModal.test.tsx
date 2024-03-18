import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEdsCoreReact } from "__testUtils__/mocks/EDSMocks";
import {
  getAxisDefinition,
  getLogCurveInfo,
  getLogObject,
  renderWithContexts
} from "__testUtils__/testUtils";
import LogCurveInfoPropertiesModal, {
  LogCurveInfoPropertiesModalProps
} from "components/Modals/LogCurveInfoPropertiesModal";
import JobService from "services/jobService";

jest.mock("services/jobService");
jest.mock("@equinor/eds-core-react", () => mockEdsCoreReact());

const simpleProps: LogCurveInfoPropertiesModalProps = {
  logCurveInfo: getLogCurveInfo(),
  dispatchOperation: jest.fn(),
  selectedLog: getLogObject()
};

const propsWithAxisDefinition: LogCurveInfoPropertiesModalProps = {
  ...simpleProps,
  logCurveInfo: getLogCurveInfo({
    axisDefinitions: [getAxisDefinition()]
  })
};

it("Properties of a LogCurve should be shown in the modal", async () => {
  const expectedLogCurveInfo = simpleProps.logCurveInfo;

  renderWithContexts(<LogCurveInfoPropertiesModal {...simpleProps} />);

  const uidInput = screen.getByRole("textbox", { name: /uid/i });
  const mnemonicInput = screen.getByRole("textbox", { name: /mnemonic/i });

  expect(uidInput).toHaveValue(expectedLogCurveInfo.uid);
  expect(mnemonicInput).toHaveValue(expectedLogCurveInfo.mnemonic);

  expect(uidInput).toBeDisabled();
  expect(mnemonicInput).toBeEnabled();
});

it("AxisDefinition should be shown readonly in the LogCurveInfo modal when included in the props", async () => {
  const expectedLogCurveInfo = propsWithAxisDefinition.logCurveInfo;
  const expectedAxisDefinition = expectedLogCurveInfo.axisDefinitions[0];

  renderWithContexts(
    <LogCurveInfoPropertiesModal {...propsWithAxisDefinition} />
  );

  const uidInput = screen.getByRole("textbox", { name: /uid/i });
  const mnemonicInput = screen.getByRole("textbox", { name: /mnemonic/i });
  const axisDefinitionLabel = screen.getByText(/axisdefinition/i);
  const orderInput = screen.getByRole("textbox", { name: /order/i });
  const countInput = screen.getByRole("textbox", { name: /count/i });
  const doubleValuesInput = screen.getByRole("textbox", {
    name: /doubleValues/i
  });

  expect(uidInput).toHaveValue(expectedLogCurveInfo.uid);
  expect(mnemonicInput).toHaveValue(expectedLogCurveInfo.mnemonic);
  expect(axisDefinitionLabel).toHaveTextContent(expectedAxisDefinition.uid);
  expect(orderInput).toHaveValue(expectedAxisDefinition.order.toString());
  expect(countInput).toHaveValue(expectedAxisDefinition.count.toString());
  expect(doubleValuesInput).toHaveValue(expectedAxisDefinition.doubleValues);

  expect(uidInput).toBeDisabled();
  expect(mnemonicInput).toBeEnabled();
  expect(orderInput).toBeDisabled();
  expect(countInput).toBeDisabled();
  expect(doubleValuesInput).toBeDisabled();
});

it("Saving edited properties of a LogCurve should result in the order of a job", async () => {
  const mockedOrderJob = jest.fn();
  JobService.orderJob = mockedOrderJob;

  const user = userEvent.setup();

  renderWithContexts(<LogCurveInfoPropertiesModal {...simpleProps} />);

  const mnemonicInput = screen.getByRole("textbox", { name: /mnemonic/i });
  const saveButton = screen.getByRole("button", { name: /save/i });

  await user.type(mnemonicInput, "editedMnemonic");

  expect(saveButton).toBeEnabled();

  await user.click(saveButton);

  expect(mockedOrderJob).toHaveBeenCalledTimes(1);
});
