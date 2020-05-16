import React from "react";
import { Layout } from 'antd';

import { ThemeContext } from '../../App'

import styles from './styles.module.scss'

function NavigationBar(){
  return (
    <ThemeContext.Consumer>
      {({theme}) => (
        <Layout.Footer className={styles.footer+' '+styles[theme]}>
          <div>
            <div>
              <h3>Team</h3>
              <h4>Lisa</h4>
              <h4>Danielle</h4>
              <h4>Brian</h4>
              <br/>
              <h4>Join us!</h4>
            </div>
            <div>
              <h3>Learn More</h3>
              <h4>Manifesto</h4>
              <h4>Works</h4>
              <h4>Stories</h4>
            </div>
            <div>
              <h3>Meet Us</h3>
              <h4>Studio</h4>
              <h4>Community</h4>
              <h4>Workshops</h4>
            </div>
            <div>
              <h3>Contact</h3>
              <h4>Twitter</h4>
              <h4>Facebook</h4>
              <h4>Instagram</h4>
            </div>
          </div>
        </Layout.Footer>
      )}
    </ThemeContext.Consumer>
  )
}

export default NavigationBar;