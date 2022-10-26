# Haystack

This Haystack website is built using [Hugo](https://github.com/gohugoio/hugo), a static website generator written in Go.

## Contribute

1. Install Hugo using the [appropriate installation method](https://gohugo.io/getting-started/installing/) for your OS
2. Clone the project locally, and install dependencies by running `./build.sh`
3. Add or edit any content in the /content directory
4. Start a local Hugo server (with drafts enabled) by running `hugo server -D`
5. Visit http://localhost:1313/ in your browser to preview any changes made

### Adding new content

**Edits and Additions to Tutorials**:

The tutorials are maintained in the [`haystack-tutorials` repository](https://github.com/deepset-ai/haystack-tutorials)

1. Check out the [Contributing Guidelines](https://github.com/deepset-ai/haystack-tutorials/blob/main/Contributing.md)
2. Create a PR on the `haystack-tutorials` repository
3. When merged, your changes will reflect on the Haystack website after the next deployment

### Shortcodes

You can use Hugo shortcodes in markdown to call various built-in or custom templates.

**Embedding a Youtube or Vimeo video:**

```
{{< youtube w7Ft2ymGmfc >}}

{{< vimeo 146022717 >}}
```

**Adding a button:**

```
{{< button url="https://github.com/deepset-ai/haystack-home" text="Haystack website Github Repo" color="green">}}

# colors options: green, blue, dark-blue
```

**Adding tabbed content:**

```
{{< tabs totalTabs="2">}}
{{< tab tabName="First Tab Name" >}}

First tab content here

{{< /tab >}}

{{< tab tabName="Second Tab Name" >}}

Second tab content here

{{< /tab >}}
{{< /tabs >}}
```

### Editing the theme

HTML template files are located at /themes/haystack/layouts

CSS (Sass) files are located at /themes/haystack/assets/sass