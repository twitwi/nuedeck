
(I'm switching to https://sli.dev/ and not actively maintaining the nuedeck project)


# NueDeck

NueDeck is a framework to make nice and robust presentations using markdown or HTML, .

<p>
NueDeck comes with many features for increased productivity including
a powerful extended markdown syntax,
easy incremental display and SVG animations,
inline latex/math equations,
automatic presentation scaling with preserved aspect ratio,
PDF export (already integrated in <a href="https://github.com/astefanutti/decktape">DeckTape</a>, see below),
and more…
</p>

NueDeck is built in a modular way, so it is easy to add new features.
If you like, you can reuse or develop plugins and even leverage the fact that NueDeck is based on [Vue.js](https://vuejs.org/) to do more advanced things.

<p>
Historically, this project is born as a rewrite of <a href="https://github.com/twitwi/deck.js">Deck.js with extensions</a>.
The goal has been to keep a modular approach (with plugins) but to have a better integration of important things (slide steps, animations, keyboard handling, etc) and to leverage existing tool chains for development and build.
The rewrite uses and leverages <a href="https://vuejs.org/">Vue.js</a> but does not require any knowledge about it to write slides (or even some plugins).
</p>

### To create a NueDeck presentation

See the [NueDeck Starter Kit](https://github.com/twitwi/nuedeck-starterkit) (coming soon).

In the meantime, you can [download a release](https://dl.heeere.com/temporary-nuedeck-release.zip) and modify the html file.

For simple things, you can try to directly visualize your presentation using a `file:///` URL.
To have a live reload of your presentation while you edit it, you can install and use a simple tool (if you have node.js), with:

~~~
npm install -g simple-hot-reload-server
hrs .
# or: hrs the-name-of-the-folder-with-your-presentation
~~~

Then you can view your presentation at http://localhost:8082/example.html (if the file name is `example.html`).


----

### Exporting to pdf

The latest version of [DeckTape](https://github.com/astefanutti/decktape) includes support for NueDeck (to export only top level slides and not every animation step).
Until a new version is released on npm, you can install the latest version with:

~~~
npm install -g git+ssh://git@github.com:astefanutti/decktape.git
# or
npm install -g git+https://github.com/astefanutti/decktape.git
~~~

----

----

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
