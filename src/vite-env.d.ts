/// <reference types="vite/client" />

declare module '~icons/*' {
    import { FunctionComponent, SVGProps } from 'react';
    const component: FunctionComponent<SVGProps<SVGSVGElement>>;
    export default component;
}
