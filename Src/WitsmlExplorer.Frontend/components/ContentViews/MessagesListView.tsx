import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import { MessageObjectContextMenuProps } from "../ContextMenus/MessageObjectContextMenu";
import NavigationContext from "../../contexts/navigationContext";
import MessageObject from "../../models/messageObject";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import MessageObjectContextMenu from "../ContextMenus/MessageObjectContextMenu";

export interface MessageObjectRow extends ContentTableRow, MessageObject {}

export const MessagesListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [messages, setMessages] = useState<MessageObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.messages) {
      setMessages(selectedWellbore.messages);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return messages.map((msg) => {
      return { id: msg.uid, ...msg };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.DateTime },
    { property: "name", label: "Name", type: ContentType.String },
    { property: "messageText", label: "Message text", type: ContentType.String }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedMessageObjectRows: MessageObjectRow[]) => {
    const contextProps: MessageObjectContextMenuProps = { checkedMessageObjectRows, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <MessageObjectContextMenu {...contextProps} />, position } });
  };

  return <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default MessagesListView;
