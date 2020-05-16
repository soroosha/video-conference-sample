import React, { useState, useCallback } from 'react';
import { withRouter, Route } from "react-router-dom";
import { Layout } from 'antd';
import 'antd/dist/antd.css'; 

import NavigationBar from "./components/NavigationBar"
import Footer from "./components/Footer"
import VideoConference from "./components/VideoConference"

import styles from './app.module.scss';

export const ThemeContext = React.createContext({
  theme:'dark',
  toggleTheme: ()=>{}
});

function App() {
  const [theme, setTheme] = useState('dark')
  const toggleTheme = useCallback(()=>{
    setTheme(theme==='light'? 'dark' : 'light')
  },[theme])

  return (
    <ThemeContext.Provider value={{theme, toggleTheme}}>
      <Layout className={styles.app+' '+styles[theme]}>
        <NavigationBar/>
        <Layout.Content className={styles.content}>
          <Route exact path="/" component={VideoConference} />
          <Footer/>
        </Layout.Content>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default withRouter(App);
