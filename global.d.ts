declare module '*.css';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      html: any;
      head: any;
      body: any;
      meta: any;
      title: any;
      link: any;
      style: any;
    }
  }
}

export {};
