# Media Suite Website

Uses [Jekyll](https://jekyllrb.com/) static site generator and [Gulp](http://gulpjs.com/) to build files ready for deployment.

## Setup & Making Changes

1. Install Jekyll: `gem install jekyll`
2. Once in site directory (`src`), run `jekyll serve`. This will watch all files and compile any changes to `_site` directory. Site will be served up at `http://localhost:4000/`.

\* `baseurl` setting in `_config.yml` will need editing if not serving site up from root of domain. For example, when publishing site to `http://mediasuitenz.github.io/media-suite-site/`, `baseurl` needs to be set to `"/media-suite-site"`. To edit and serve site up locally without modifying this setting, run `jekyll serve --baseurl ''`.

## Making Changes

As a rule, don't make changes to anything in `_site` directory as it will just get overwritten when changes are made and site is compiled into the `_site` directory.

### Adding/Editing Pages

Home page (`/index.html`) is stored in root of the `src` directory. To add pages, create a directory with the name of the intended path (i.e. new-page) and create an index.html file within it (this allows for us to drop the file extension when visiting the page - so I can go to `/new-page` instead of `/new-page.html`).

To create a sub-page, follow the same process within the parent page directory. For example, to create a sub-page of new-page, I'd create a directory called `/sub-page` within the `/new-page` directory and add an index.html file. I'd then be able to access the sub-page at `/new-page/sub-page`.

### Page Templates

Page templates use [Liquid](http://liquidmarkup.org/). Each template starts with a block of YAML front matter - this defines the layout (surrounding template which includes header/footer etc) that will be used for the template, the page title and any other custom attributes used to pass information between templates. Common attributes currently being used define the menu order and title for each page and are accessible through the menu template (`_includes/menu.html`) like so:
```
<ul id="menu-list" class="lowercase fancy-pants-font">
  {% assign pages = site.pages | sort: "menuorder" %}
  {% for p in pages %}
    {% if p.menutitle %}
    <li><a href="{{ p.url | prepend: site.baseurl }}" class="menu-link{% if p.url == page.url %} active{% endif %}">{{ p.menutitle }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
```

### Editing CSS

Just edit stylesheets in `/css` directory. If `jekyll serve` is running, changes will be compiled to `_site/css` on save.

### Editing JavaScript

As with the CSS, all JavaScript can be edited directly in the `/js` directory and will be compiled with the site to  `_site/js` on save if `jekyll serve` is running.

Plugins that don't need separating out due to the InstantClick plugin (see next paragraph) can be saved in the `js/concat` directory. Any files saved to this directory will be concatenated and minified by Gulp when building the files for deployment.

Just be aware that the site uses [InstantClick.js](http://instantclick.io/) to pre-fetch pages when user hovers over a link, similar to pjax functionality. This means the `<head>` section and and assets load in on the initial page load and the `<body>` tag is all that swaps out on page change. Custom events to replace the likes of `$(document).ready()` etc can be found here: http://instantclick.io/scripts

In `custom.js`, the JS related to each page is broken up into modules and initialised on page change depending on classes applied to the main wrapper for each page.

## Deploying Site

Gulp is used to generate a version of the files ready to deploy to the live site. To generate these files, navigate to the root folder of the project and run `gulp`. This will output the required files to the `dist` directory, ready to upload to the server.

### Gulp

#### Gulp Plugins

Most plugins included in the gulp file are self explanatory but you need to be aware of the [gulp-processhtml](https://github.com/Wildhoney/gulp-processhtml) one when editing the site html and including new css/js assets.

You'll notice comments in the Jekyll templates around some script/style tags that look like this:
`<!-- build:remove -->
<link rel="stylesheet" href="{{ "/css/normalize.min.css" | prepend: site.baseurl }}">
<!-- /build -->`

It's important that these comments are not deleted/modified unless you know what you're doing. They allow us to keep js/css assets separate and unminified during development and tell Gulp how to modify these asset links when the files are minified/concatenated/moved for deployment.

#### Adding new pages for deployment

If you add a new page to the site, you'll need to make sure you also add it to the html task in the gulpfile. Just add the directory of the page(s) to the array var `filesToMove`.
