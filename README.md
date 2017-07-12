# transforms
 
An All-in-one personal browserify transformer for `js`, `css`, `scss`, `less`, 'styl`....

So, we can:

#### bundle, transpile javascript

use baelify internally

#### Compile scss,less,styl and transform to css

so we can write something like this

```
const css = require('./site.scss');
```

and use [inject-css](https://www.npmjs.com/package/inject-css) to insert the css

```
const inject = require('inject-css');
const delcss = inject(css);
```

and delete the css if we want to change theme or something like that
```
delcss();
```


## Usage

Under the project directory,

> npm install transforms -S

In the package.json, add the following:

```
"browserify": {
    "transform": [
      "transforms",
    ]
  },
```