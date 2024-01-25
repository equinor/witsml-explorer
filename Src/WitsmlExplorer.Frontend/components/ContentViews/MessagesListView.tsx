import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import MessageObjectContextMenu from "components/ContextMenus/MessageObjectContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import MessageObject from "models/messageObject";
import React, { useContext, useEffect, useState } from "react";

export interface MessageObjectRow extends ContentTableRow {
  message: MessageObject;
}

export const MessagesListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [messages, setMessages] = useState<MessageObject[]>([]);

  useEffect(() => {
    if (selectedWellbore?.messages) {
      setMessages(selectedWellbore.messages);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return messages.map((msg, index) => {
      return {
        id: msg.uid,
        index: index + 1,
        dTim: formatDateString(msg.dTim, timeZone, dateTimeFormat),
        messageText: msg.messageText,
        uid: msg.uid,
        name: msg.name,
        typeMessage: msg.typeMessage,
        sourceName: msg.commonData.sourceName,
        dTimCreation: formatDateString(
          msg.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          msg.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        comments: msg.commonData.comments,
        message: msg
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "index", label: "#", type: ContentType.Number },
    { property: "dTim", label: "dTim", type: ContentType.DateTime },
    { property: "messageText", label: "messageText", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "name", label: "name", type: ContentType.String },
    { property: "typeMessage", label: "typeMessage", type: ContentType.String },
    {
      property: "sourceName",
      label: "commonData.sourceName",
      type: ContentType.String
    },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    },
    {
      property: "comments",
      label: "commonData.comments",
      type: ContentType.String
    }
  ];

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedMessageObjectRows: MessageObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedMessageObjectRows.map((row) => row.message),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <MessageObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    Object.is(selectedWellbore?.messages, messages) && (
      <ContentTable
        viewId="messagesListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="Messages"
      />
    )
  );
};

export default MessagesListView;
