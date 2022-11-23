import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import MessageObject from "../../models/messageObject";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import MessageObjectContextMenu, { MessageObjectContextMenuProps } from "../ContextMenus/MessageObjectContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import { clipLongString } from "./ViewUtils";

export interface MessageObjectRow extends ContentTableRow {
  message: MessageObject;
}

export const MessagesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { selectedWellbore, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [messages, setMessages] = useState<MessageObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.messages) {
      setMessages(selectedWellbore.messages);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return messages.map((msg, index) => {
      return {
        id: msg.uid,
        index: index + 1,
        dTim: formatDateString(msg.dTim, timeZone),
        messageText: clipLongString(msg.messageText, 30),
        uid: msg.uid,
        name: msg.name,
        typeMessage: msg.typeMessage,
        sourceName: msg.commonData.sourceName,
        dTimCreation: formatDateString(msg.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(msg.commonData.dTimLastChange, timeZone),
        comments: msg.commonData.comments,
        message: msg
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "index", label: "#", type: ContentType.Number },
    { property: "dTim", label: "dTim", type: ContentType.DateTime },
    { property: "messageText", label: "messageText", type: ContentType.String },
    { property: "uid", label: "UID", type: ContentType.String },
    { property: "name", label: "name", type: ContentType.String },
    { property: "typeMessage", label: "typeMessage", type: ContentType.String },
    { property: "sourceName", label: "commonData.sourceName", type: ContentType.String },
    { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime },
    { property: "comments", label: "commonData.comments", type: ContentType.String }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedMessageObjectRows: MessageObjectRow[]) => {
    const contextProps: MessageObjectContextMenuProps = { checkedMessageObjectRows, dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <MessageObjectContextMenu {...contextProps} />, position } });
  };

  return <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default MessagesListView;
