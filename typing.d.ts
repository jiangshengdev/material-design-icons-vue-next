declare module 'material-design-icons' {
  const STATIC_PATH: string;
}

declare module 'gulp-concat-css' {
  import concatCss from 'gulp-concat-css';
  export default concatCss
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
