import React, { useContext } from "react";
import TreeItem from "./TreeItem";
import Wellbore from "../../models/wellbore";
import Well from "../../models/well";
import MessageObject from "../../models/messageObject";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";

interface MessageItemProps {
  message: MessageObject;
  messageGroup: string;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  nodeId: string;
}

const MessageItem = (props: MessageItemProps): React.ReactElement => {
  const { message, well, wellbore, selected, nodeId } = props;
  const { dispatchNavigation } = useContext(NavigationContext);

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={message.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectMessageObject, payload: { message, well, wellbore } })}
    />
  );
};
export default MessageItem;
