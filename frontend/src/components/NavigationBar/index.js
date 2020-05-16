import React from "react";
import { Layout, Switch } from 'antd';

import { ThemeContext } from '../../App'


import styles from './styles.module.scss'

function NavigationBar(){
  return (
    <ThemeContext.Consumer>
      {({theme, toggleTheme}) => (
      <Layout.Header className={styles.navigationBar+' '+styles[theme]}>
        <div>
          vce.
          <Switch 
            className={styles.switch}
            checkedChildren='Light'
            unCheckedChildren='Dark'
            onChange={toggleTheme}
          />
        </div>
      </Layout.Header>
      )}
    </ThemeContext.Consumer>
  )
}

export default NavigationBar;