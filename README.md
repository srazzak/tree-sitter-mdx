# tree-sitter-mdx

> [!NOTE]
> This is still a WIP. See TODO below for what needs to be covered.

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

- [x] Support full JavaScript + JSX grammar rules
- [x] Support full Markdown grammar rules
- [x] Support base highlighting + injections
- [ ] Cover differences between Markdown and MDX
- [ ] Cover differences between JSX/JavaScript and MDX
- [ ] Fix highlighting issues
- [ ] Improve test coverage
