import React from 'react';
import ReactDomServer from 'react-dom/server';
import SSR from './ssr';
import ssrId from './ssrId';

const App: React.FC<{
  type: string;
  id?: number;
}> = ({ type }) => {
  return <>type: {type}</>;
};

ReactDomServer.renderToString(
  <>
    <SSR id={ssrId.app1}>
      <App type="1" />
    </SSR>
    <SSR id={ssrId.app1}>
      <App type="1" />
    </SSR>
    <SSR id={ssrId.app1}>
      <App type="1" id={3} />
    </SSR>
    <SSR id={ssrId.app1}>
      <App type="12" />
    </SSR>
    <SSR id={ssrId.app2}>
      <App type="1" />
    </SSR>
  </>
);
