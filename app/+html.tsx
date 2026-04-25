import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveStyles = `
  body {
    background-color: #05060A;
    overflow: hidden; /* Evita o scroll de rebote do navegador no mobile */
  }
`;