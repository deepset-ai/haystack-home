# Haystack Home

The Haystack Home website is built using [Hugo](https://github.com/gohugoio/hugo), a static website generator written in Go. 

## Contribute

1. Install Hugo using the [appropriate installation method](https://gohugo.io/getting-started/installing/) for your OS
2. Clone the project locally, and install dependencies by running `npm install`
3. Add or edit any content in the /content directory
4. Start a local Hugo server (with drafts enabled) by running `hugo server -D`
5. Visit http://localhost:1313/ in your browser to preview any changes made

### Adding new content

**New tutorial page**:

1. Run `hugo new tutorials/new-tutorial.md`, replacing "new-tutorial" with the slug (url) of the tutorial
2. This will create a new tutorial markdown template in the /content/tutorials directory
3. Update the front matter in the markdown file and add your markdown content
4. Check this [markdown guide](https://www.markdownguide.org/basic-syntax/) if you need help with formatting

### Shortcodes

You can use Hugo shortcodes in markdown to call various built-in or custom templates.

**Embedding a Youtube or Vimeo video:**

```
{{< youtube w7Ft2ymGmfc >}}

{{< vimeo 146022717 >}}
```

**Adding a button:**

```
{{< button url="https://github.com/deepset-ai/haystack-home" text="Haystack Home Github Repo" color="green">}}

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