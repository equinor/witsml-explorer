import { Icon, Typography } from "@equinor/eds-core-react";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import { useOperationState } from "hooks/useOperationState";
import React, { useImperativeHandle, useRef, useState } from "react";
import StyledMenu from "../StyledComponents/StyledMenu";

export interface NestedMenuItemProps extends Omit<MenuItemProps, "button"> {
  label: string;
  ContainerProps?: React.HTMLAttributes<HTMLElement> &
    React.RefAttributes<HTMLElement | null>;
  icon?: string;
}

const NestedMenuItem = React.forwardRef<
  HTMLLIElement | null,
  NestedMenuItemProps
>(function NestedMenuItem(props: NestedMenuItemProps, ref) {
  const {
    label,
    children,
    icon,
    tabIndex: tabIndexProp,
    ContainerProps: ContainerPropsProp = {},
    ...MenuItemProps
  } = props;
  const {
    operationState: { colors }
  } = useOperationState();

  const { ref: containerRefProp, ...ContainerProps } = ContainerPropsProp;

  const menuItemRef = useRef<HTMLLIElement>(null);
  useImperativeHandle(ref, () => menuItemRef.current);

  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    containerRefProp as React.RefObject<HTMLElement>,
    () => containerRef.current
  );

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setIsSubMenuOpen(true);

    if (ContainerProps?.onMouseEnter) {
      ContainerProps.onMouseEnter(event);
    }
  };
  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    setIsSubMenuOpen(false);

    if (ContainerProps?.onMouseLeave) {
      ContainerProps.onMouseLeave(event);
    }
  };

  const isSubmenuFocused = () => {
    const active = containerRef.current?.ownerDocument?.activeElement;
    const childItems = Array.from(menuContainerRef.current?.children);
    const index = childItems.findIndex((item) => item === active);
    return index != -1;
  };

  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (event.target === containerRef.current) {
      setIsSubMenuOpen(true);
    }

    if (ContainerProps?.onFocus) {
      ContainerProps.onFocus(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      return;
    }

    if (isSubmenuFocused()) {
      event.stopPropagation();
    }

    const active = containerRef.current?.ownerDocument?.activeElement;

    if (event.key === "ArrowLeft" && isSubmenuFocused()) {
      containerRef.current?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      event.target === containerRef.current &&
      event.target === active
    ) {
      const firstChild = menuContainerRef.current?.children[0] as
        | HTMLElement
        | undefined;
      firstChild?.focus();
    }
  };

  // Root element must have a `tabIndex` attribute for keyboard navigation
  let tabIndex;
  if (!props.disabled) {
    tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
  }

  return (
    <div
      {...ContainerProps}
      ref={containerRef}
      onFocus={handleFocus}
      tabIndex={tabIndex}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <MenuItem {...MenuItemProps} ref={menuItemRef}>
        <StyledIcon
          name={icon ?? "launch"}
          color={colors.interactive.primaryResting}
        />
        <Typography color={"primary"}>{label}</Typography>
        <Icon name="arrowDropRight" />
      </MenuItem>
      <StyledMenu
        // Set pointer events to 'none' to prevent the invisible Popover div
        // from capturing events for clicks and hovers
        style={{ pointerEvents: "none" }}
        anchorEl={menuItemRef.current}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
        open={isSubMenuOpen}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        onClose={() => {
          setIsSubMenuOpen(false);
        }}
      >
        <div ref={menuContainerRef} style={{ pointerEvents: "auto" }}>
          {children}
        </div>
      </StyledMenu>
    </div>
  );
});

export default NestedMenuItem;
