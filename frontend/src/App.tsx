import { Route, Routes } from 'react-router';
import Welcome from './pages/Welcome';
import ChatView from './pages/ChatView';
import { Provider } from 'react-redux';
import { store } from './app/store';

function App() {
  return (
    <Provider store={store}>

      <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/chat" element={<ChatView/>}/>
      </Routes>
    </Provider>
  );
}

export default App;
