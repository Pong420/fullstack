import React, { ReactNode } from 'react';
import router from 'next/router';
import { Button, H4 } from '@blueprintjs/core';
import { resolve } from 'styled-jsx/css';

interface Props {
  title?: ReactNode;
  goback?: string;
  children?: ReactNode;
}

const h4 = resolve`
  h4 {
    margin-bottom: 0;
  }
`;

const button = resolve`
  button {
    margin-right: 5px;
    margin-left: -5px;
  }
`;

export function PageHeader({ title, goback, children }: Props) {
  return (
    <div className="header">
      <div className="title">
        {goback && (
          <Button
            minimal
            icon="arrow-left"
            className={button.className}
            onClick={() => router.push(goback)}
          />
        )}
        <H4 className={h4.className}>{title}</H4>
      </div>
      <div>{children}</div>
      {h4.styles}
      {button.styles}
      <style jsx>
        {`
          .header {
            @include flex(center, space-between);
          }

          .title {
            @include flex(center);
          }
        `}
      </style>
    </div>
  );
}