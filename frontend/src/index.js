import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
// import { ApolloClient } from 'apollo-client';
// import { InMemoryCache } from 'apollo-cache-inmemory';
// import { HttpLink } from 'apollo-link-http';
// import { ApolloProvider } from '@apollo/react-hooks';

import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';


// const cache = new InMemoryCache();
// const link = new HttpLink({
//   uri: 'http://localhost:8080/graphql/'
// })

// const client = new ApolloClient({
//   cache,
//   link
// })

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();