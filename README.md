# tree-sitter-mdx

MDX grammar for tree-sitter.

- [tree-sitter-javascript](https://github.com/tree-sitter/tree-sitter-javascript) for JavaScript and JSX.
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) for Markdown.

<img width="686" height="678" alt="image" src="https://github.com/user-attachments/assets/eacb17f4-ab14-4dfc-acb9-0bcd9b09fb32" />

## Goals

Overall, the goal is to re-use the existing grammars as much as possible.
However, since MDX should technically be treated as its own language, we
can't naively inject JavaScript or Markdown syntax in the correct blocks as
there are differences. So we instead re-implement the existing grammars with
some changes to properly support MDX.
