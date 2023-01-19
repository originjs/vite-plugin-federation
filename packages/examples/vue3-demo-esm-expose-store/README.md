# Vue3 Module Federation Demo

This is an example of sharing pinia store data, to ensure that the sharing is successful, there is no actual code inside the store on the remote side, I use null to represent like this
```js
export const counterState = null;
```

## RUN
```shell
pnpm run build
pnpm run serve
```