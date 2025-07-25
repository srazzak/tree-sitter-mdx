# tree-sitter-mdx

> [!NOTE]
> This is still a WIP. See Todo below for what needs to be covered.

MDX grammar for tree-sitter. Re-uses the existing Markdown and JavaScript grammars.

- [tree-sitter-javascript](https://github.com/tree-sitter/tree-sitter-javascript) for JavaScript and JSX.
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) for Markdown.

This parser should offer quite good coverage and highlighting for MDX
files in its current state. There are still some items of work to be
done (see To-do below).

## Goals

Overall, the goal is to re-use the existing grammars as much as possible.
However, since MDX should technically be treated as its own language, we
can't naively inject JavaScript or Markdown syntax in the correct blocks as
there are differences. So we instead re-implement the existing grammars with
some changes to properly support MDX.

## To-do

This project is still a WIP, but the following is the core tasks required or done:

### Base

- [x] Support full JavaScript + JSX grammar rules
- [x] Support full Markdown grammar rules

### MDX differences

- [x] Remove indented code blocks
- [x] Remove HTML blocks
- [x] Remove autolinks
- [x] Remove comments (both HTML + JavaScript)

### Other
- [ ] Fix JSX identifier highlight issue
- [ ] Fix fenced code block injection (likely due to backtick collision for fenced code block in MD vs. template literals in JS)
- [ ] Improve test coverage
