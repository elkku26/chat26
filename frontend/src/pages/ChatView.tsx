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

    //note to self: on StrictMode (which is on by default in the dev env) causes this component to render twice
    //which also means the data is loaded twice, which looks a lot like a bug (especially looking at it from the server's point of view!)
    //but I've confirmed this behaviour goes away when strictmode is turned off
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_REST_ENDPOINT}:${process.env.REACT_APP_REST_PORT}/messages`
        )

      const parsedResponse: ChatMessage[] = await response.json()

      console.log("parsedresponse is", parsedResponse)

      dispatch(setChat(parsedResponse))
    }
    fetchData();
  }, [dispatch]) //dispatch will never actually change but useEffect doesn't know what

  return (
    <div className="ChatView">
      <h1>{userName}</h1>
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
