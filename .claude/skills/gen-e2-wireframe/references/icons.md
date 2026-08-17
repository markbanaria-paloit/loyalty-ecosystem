# Wireframe Icon Names

The `icon` component renders a VS Code codicon glyph. Set the `name` prop to any value from the curated list below.

```json
{ "id": "ico-1", "type": "icon", "props": { "name": "heart" } }
```

The full VS Code codicons catalogue is at https://microsoft.github.io/vscode-codicons/dist/codicon.html — however only the names below are validated and available in the wireframe editor's properties panel picker.

---

## Available Icon Names

### Navigation
`home` · `arrow-left` · `arrow-right` · `arrow-up` · `arrow-down`  
`chevron-left` · `chevron-right` · `chevron-up` · `chevron-down`  
`menu` · `close` · `back` · `forward`

### Actions
`add` · `remove` · `edit` · `trash` · `check` · `save` · `copy` · `paste`  
`search` · `filter` · `sort-precedence` · `refresh` · `sync`  
`download` · `upload` · `export` · `import` · `share` · `send`  
`redo` · `undo` · `replace`

### Status & Feedback
`info` · `warning` · `error` · `check-all`  
`circle-filled` · `circle` · `circle-large` · `circle-slash`  
`pass` · `pass-filled` · `bell` · `bell-slash` · `flag`

### User & Social
`account` · `person` · `person-add` · `organization`  
`mail` · `mail-read` · `mention` · `comment` · `comment-discussion`  
`thumbsup` · `thumbsdown` · `reactions`

### Content
`bookmark` · `star-empty` · `star-full` · `heart` · `heart-filled`  
`pin` · `pinned` · `eye` · `eye-closed` · `link` · `link-external`  
`file` · `file-text` · `file-media` · `file-pdf` · `file-code`  
`folder` · `folder-opened` · `notebook`

### Media & Playback
`play` · `play-circle` · `stop-circle` · `record` · `debug-pause`  
`music` · `mic` · `unmute` · `mute`

### Settings & Tools
`gear` · `settings` · `settings-gear` · `tools` · `wand` · `sparkle`  
`key` · `lock` · `unlock` · `shield`

### Layout & Data
`layout` · `split-horizontal` · `split-vertical` · `multiple-windows`  
`table` · `database` · `graph` · `graph-line` · `pie-chart`  
`list-unordered` · `list-ordered` · `symbol-array`

### Miscellaneous
`location` · `globe` · `calendar` · `clock` · `history`  
`tag` · `versions` · `rocket` · `lightbulb` · `question` · `smiley`

---

> The default icon name when none is specified is `circle-filled`.  
> Names outside this list will silently render as an empty glyph in the canvas.
