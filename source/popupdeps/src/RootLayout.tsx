// @ts-nocheck 
import { Outlet, useNavigation } from 'react-router-dom';
import { EditorProvider } from './Components/Contexts/useEditor';
import Header from './Components/Header/Header';
import { useMediaQuery } from 'react-responsive';

const RootLayout: React.FC = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 500px)' });
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";
    return (
    <div id="app">
      <EditorProvider>
        <Header />
        <div id="detail" className={isLoading ? "loading" : ""}>
          {isLoading && <div className='loader-container'><span className="loader"></span></div>}
          <Outlet context={{ isMobile }} />
        </div>
      </EditorProvider>
    </div>
  );
}

export default RootLayout;