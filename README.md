# NueDeck

NueDeck is a framework to build efficient presentation using markdown or HTML.

<p>
NueDeck is built to be extensible but already comes with many features for increased productivity
including an improved markdown syntax, latex/math equations,
</p>

If you like, you can leverage the fact that it is based on [Vue.js](http://vuejs.org/) to do more advanced things.


### To create a NueDeck presentation

see the [NueDeck Starter Kit](https://github.com/twitwi/nuedeck-starterkit) (coming soon).


### Compile and hot-reload, for development
```
npm run serve
```

This will serve `public/index.html` with hot reload of both the presentation and the framework.


### Compile, minify and copy fonts, for production/release
```
npm run build
```

Usage examples

```
Examples:
  ./custom-release.sh release/
  ./custom-release.sh release/ no-npm
  ./custom-release.sh release/ no-npm recreate
All options?
    recreate
    no-npm
    no-theme-fonts
    all-theme-fonts
    no-katex-fonts
```

`recreate` will remove the target folder (`release/`) and recreate it.
`no-npm` is mostly for developing the releaser, it does not call `npm build`
