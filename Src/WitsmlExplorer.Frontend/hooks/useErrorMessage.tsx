import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function useErrorMessage() {
  const error = useRouteError();

  let errorMessage: string;
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage =
      "Unknown error. You can find more information by checking the 'Console' tab in the developer tools.";
  }

  return errorMessage;
}
