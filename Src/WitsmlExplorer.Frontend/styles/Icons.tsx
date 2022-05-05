import { Icon } from "@equinor/eds-core-react";
import {
  chevron_right as chevronRight,
  chevron_down as chevronDown,
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
  folder_open as folderOpen,
  thumbs_down as thumbsDown
} from "@equinor/eds-icons";
const icons = {
  chevronRight,
  chevronDown,
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
  deleteToTrash,
  thumbsDown
};

Icon.add(icons);

export default Icon;
