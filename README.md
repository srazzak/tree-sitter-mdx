# tree-sitter-mdx

> [!NOTE]
> This is still a WIP.

MDX grammar for tree-sitter. Re-uses the existing Markdown and JavaScript grammars.

- [tree-sitter-javascript](https://github.com/tree-sitter/tree-sitter-javascript) for JavaScript and JSX.
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) for Markdown.

## Goals

Overall, the goal is to re-use the existing grammars as much as possible.
However, since MDX should technically be treated as its own language, we
can't naively inject JavaScript or Markdown syntax in the correct blocks as
there are differences. So we instead re-implement the existing grammars with
some changes to properly support MDX.
