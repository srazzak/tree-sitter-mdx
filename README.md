# tree-sitter-mdx

> [!NOTE]
> This is still a WIP.

MDX grammar for tree-sitter. Uses injections for Markdown, JavaScript, and JSX.

- [tree-sitter-javascript](https://github.com/tree-sitter/tree-sitter-javascript) for JavaScript and JSX.
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) for Markdown.

## Goals

Overall, the goal is to re-use the existing parsers for MDX as much as possible. Similar to the existing Markdown
parser, the goal of this parser is not for accuracy, but mainly for syntax highlighting in editors like neovim or Zed.

So instead, we borrow most of the rules from the existing Markdown grammar and then inject JSX into the JSX blocks.
