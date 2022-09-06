import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import MessageObject from "../../models/messageObject";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import TreeItem from "./TreeItem";

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
