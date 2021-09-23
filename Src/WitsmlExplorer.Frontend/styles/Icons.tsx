import { Icon } from "@equinor/eds-core-react";
import {
  trending_up as isActive,
  launch,
  format_line_spacing as formatLine,
  refresh,
  paste,
  add,
  settings,
  accessible,
  check,
  copy,
  edit,
  delete_to_trash as deleteToTrash,
  folder_open as folderOpen
} from "@equinor/eds-icons";
const icons = {
  isActive,
  launch,
  formatLine,
  refresh,
  paste,
  add,
  settings,
  accessible,
  check,
  copy,
  edit,
  folderOpen,
  deleteToTrash
};

Icon.add(icons);

export default Icon;
