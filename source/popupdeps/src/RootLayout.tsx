// @ts-nocheck 
import { Outlet } from 'react-router-dom';
import Header from './Components/Header/Header';
import { EditorProvider } from './Components/Contexts/useEditor';
import { useState } from 'react';

const RootLayout: React.FC = () => {
    const [loginModalOpened, setLoginModalOpened] = useState(false);
    const [passedValue, setPassedValue] = useState(false);
    return (
    <div id="app">
      <Header setLoginModalOpened={setLoginModalOpened}/>
      <EditorProvider>
        <Outlet context={{ setLoginModalOpened, passedValue, setPassedValue }} />
      </EditorProvider>
    </div>
  );
}

export default RootLayout;
