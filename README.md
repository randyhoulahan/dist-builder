---
sidebar: auto
---

### Description

A dev tool used to package components modern and legacy formats.

**Modern**: ESM (nodejs, SSR), ESM (browser url imports)

**Legacy**: UMD and CJS (Polyfills to IE 10)

### Install

```bash
yarn add @houlagins/dist-builder -D

#OR 

npm install @houlagins/dist-builder --dev
```

Add init to your scripts package.json to initialize the repo.
```json
  "scripts": {
    "init": "dist-builder init"
  }
```
```bash
yarn run init
```

### API

#### Build
Builds legacy and modern formats.

```
yarn run dist-builder

```
#### Build Widget
Builds legacy and modern formats for a self installing component that can be used in any html page.

example:
```html
<script nomodule="" id="view-legacy" src="https://cdn.cbd.int/@action-agenda/view@0.0.12/dist/widget/index.umd.min.js"></script>
<script  type="module" id="view" src="https://cdn.cbd.int/@action-agenda/view@0.0.12/dist/widget/index.min.js"></script> 
```

```
yarn run dist-builder widget

```
#### Build Test Widget
Builds a local version of a self installing component to for local testing.

```
yarn run dist-builder testWidget

```
#### Serve Test Widget
To serve  a local test widget

```
yarn run dist-builder serveTestWidget

```
#### Serve Widget
To serve a production widget locally without publishing to CDN first
```
yarn run dist-builder serveWidget

```