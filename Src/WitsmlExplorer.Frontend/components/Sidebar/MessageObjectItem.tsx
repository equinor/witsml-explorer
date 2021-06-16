import React, { useContext } from "react";
import TreeItem from "./TreeItem";
import Wellbore from "../../models/wellbore";
import Well from "../../models/well";
import MessageObject from "../../models/messageObject";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";

interface MessageObjectItemProps {
  message: MessageObject;
  well: Well;
  wellbore: Wellbore;
  messageGroup: string;
  selected: boolean;
  nodeId: string;
}

const MessageItem = (props: MessageObjectItemProps): React.ReactElement => {
  const { message, messageGroup, well, wellbore, selected, nodeId } = props;
  const { dispatchNavigation } = useContext(NavigationContext);

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={message.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectMessageGroup, payload: { well, wellbore, messageGroup } })}
    />
  );
};
export default MessageItem;
