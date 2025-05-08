import { selectMessages } from '../features/chatSlice';
import { selectStatus, selectUserName } from '../features/userSlice';
import { useSelector } from 'react-redux';

function ChatView() {

  const userName = useSelector(selectUserName)
  const status = useSelector(selectStatus)

  const messages = useSelector(selectMessages)

  return (
    <div className="ChatView">
    <h1>{userName} ({status})</h1>
    <ol>
        <li>
            <span>message1</span>
        </li>

        <li>
            <span>message2</span>
        </li>
    </ol>
    <div>
        <input type="textbox"/>        
    </div>
    </div>
  );
}

export default ChatView;
