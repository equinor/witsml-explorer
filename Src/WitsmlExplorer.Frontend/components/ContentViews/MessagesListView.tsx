import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import MessageObject from "../../models/messageObject";

export const MessagesListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore } = navigationState;
  const [messages, setMessages] = useState<MessageObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.messages) {
      setMessages(selectedWellbore.messages);
    }
  }, []);

  const columns: ContentTableColumn[] = [
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.DateTime },
    { property: "messageText", label: "Message text", type: ContentType.String }
  ];

  return <ContentTable columns={columns} data={messages} />;
};

export default MessagesListView;
