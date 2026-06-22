const isLoadableElement = (element) =>
  typeof HTMLElement !== "undefined" && element instanceof HTMLElement;

const setButtonLoading = (button, isLoading) => {
  if (!isLoadableElement(button)) {
    return;
  }

  if (isLoading) {
    button.dataset.loading = "true";
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-disabled", "true");
    button.style.pointerEvents = "none";

    if ("disabled" in button) {
      button.disabled = true;
    }
  } else {
    delete button.dataset.loading;
    button.removeAttribute("aria-busy");
    button.removeAttribute("aria-disabled");
    button.style.pointerEvents = "";

    if ("disabled" in button) {
      button.disabled = false;
    }
  }
};

const getSubmitter = (event) => {
  const submitter = event?.nativeEvent?.submitter;
  return isLoadableElement(submitter) ? submitter : null;
};

export const runWithButtonLoading = async (button, action) => {
  if (!isLoadableElement(button)) {
    return action();
  }

  if (button.dataset.loading === "true") {
    return;
  }

  setButtonLoading(button, true);

  try {
    return await action();
  } finally {
    setButtonLoading(button, false);
  }
};

export const withButtonLoading = (action) => async (event, ...args) => {
  return runWithButtonLoading(event?.currentTarget, () => action(event, ...args));
};

export const withSubmitButtonLoading = (action) => async (event, ...args) => {
  return runWithButtonLoading(getSubmitter(event), () => action(event, ...args));
};
