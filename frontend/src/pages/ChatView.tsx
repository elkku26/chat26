import { selectMessages, setChat } from '../features/chatSlice';
import { selectStatus, selectUserName } from '../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ChatMessage } from '../types/shared-types';
import { useEffect } from 'react';

function ChatView() {

  const userName = useSelector(selectUserName)
  const status = useSelector(selectStatus)

  const messages: ChatMessage[] = useSelector(selectMessages)

  const dispatch = useDispatch()

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "http://127.0.0.1:9000/messages" //TODO get this from env variable instead
      )

      const parsedResponse: ChatMessage[] = await response.json()

      console.log("parsedresponse is", parsedResponse)

      dispatch(setChat(parsedResponse))
    }
    fetchData();
  }, [dispatch]) //dispatch will never actually change but useEffect doesn't know what

  return (
    <div className="ChatView">
      <h1>{userName} ({status} )</h1>
      <ol>
        {messages.map((message) => {
          return (
            <li style={{ "listStyleType": "none" }} key={message.id}>
              {message.sender_id} said: {message.content} @ {message.time}
            </li>
          )
        })}
      </ol>
      <div>
        <input type="textbox" />
      </div>
    </div>
  );
}

export default ChatView;
