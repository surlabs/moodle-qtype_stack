To build the stackascii.bundle.js, etc., you need to be in this folder with write permissions. Then:

```
npm ci   # Installs node modules
npm run build   # Bundles and minifies 
```

New filters need to be placed in filters/ and explicitly added to stackascii.js