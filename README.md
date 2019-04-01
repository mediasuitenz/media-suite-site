# Media Suite Website

[![CircleCI](https://circleci.com/gh/mediasuitenz/mediasuite.co.nz/tree/master.svg?style=svg&circle-token=0aa6f0d0339d2e5dc42cfcfab1bbe239c1e48f7d)](https://circleci.com/gh/mediasuitenz/mediasuite.co.nz/tree/master)

Uses [Jekyll](https://jekyllrb.com/) static site generator and [Gulp](http://gulpjs.com/) to build files ready for deployment.

## Setup

1. Install Jekyll: `bundle install`

## Development

1. Once Jekyll is installed. Run `npm run watch`. This will watch all files and compile any changes to `_site` directory.
1. Open your browser up to `http://localhost:4000/`.

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

Just edit stylesheets in `/css` directory. If `npm run watch` is running, changes will be compiled to `_site/css` on save.

### Editing JavaScript

As with the CSS, all JavaScript can be edited directly in the `/js` directory and will be compiled with the site to  `_site/js` on save if `npm run watch` is running.

Plugins that don't need separating out can be saved in the `js/concat` directory. Any files saved to this directory will be concatenated and minified by Gulp when building the files for deployment.

In `custom.js`, the JS related to each page is broken up into modules and initialised on page change depending on classes applied to the main wrapper for each page.

## Deploying Site

Merging pull requests into the master branch will trigger a CircleCI workflow to build and deploy to the live site.

CircleCI runs `npm run build` which uses Jekyll to build all files and compile any changes to `_site` directory. Next `npm run deploy` runs the default Gulp task and the deploy task. Files are copied to the `dist` directory and rsynced to the server. The Gulp deploy task also purges the Cloudflare cache.

The CircleCI workflow takes less that 1 minute to complete.

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
