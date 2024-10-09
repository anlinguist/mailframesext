// @ts-nocheck
import './App.css'
import MainContent from './Components/MainContent/MainContent'
import '@mantine/core/styles.css';
import { Button, ColorSchemeScript, MantineColorsTuple, MantineProvider, createTheme } from '@mantine/core';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './RootLayout';
import { AuthProvider } from './Components/Contexts/AuthContext';
// import { authLoader } from './loaders';
// import Settings from './Components/Settings';
// import Templates from './Components/Templates';

const mfgreen: MantineColorsTuple = [
  '#f1f8ef',
  '#e4ece3',
  '#c9d6c6',
  '#aabfa6',
  '#91ac8b',
  '#80a07a',
  '#779a70',
  '#65865e',
  '#587752',
  '#496743'
];

const theme = createTheme({
  fontFamily: 'Montserrat, sans-serif',
  colors: {
    mfgreen,
    dark: [
      '#a9a9a9',
      '#959595',
      '#818181',
      '#6d6d6d',
      '#5b5b5b',
      '#484848',
      '#373737',
      '#262626',
      '#171717',
      '#000000'
    ],
  },
  components: {
    Button: Button.extend({
      styles: {
        root: { margin: '15px 0' },
        inner: { fontWeight: 300, fontSize: 16 },
      },
    }),
  },
});

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <MainContent />,
      },
      // {
      //   path: 'templates',
      //   element: <Templates />,
      // },
      // {
      //   path: 'settings',
      //   element: <Settings />,
      //   loader: authLoader, // Protect this route
      // },
    ],
  },
]);

function App() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider defaultColorScheme='auto' theme={theme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MantineProvider>
    </>
  )
}

export default App
