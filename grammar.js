/**
 * @file Tree-sitter grammar for MDX
 * @author Suhail Razzak <suhail.razzak@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "mdx",

  rules: {
    document: ($) => repeat(choice($.jsx_component, $.markdown, $.expression)),

    jsx_component: ($) =>
      seq(
        $.jsx_opening_tag,
        repeat($.jsx_content), // Content inside the tag
        $.jsx_closing_tag,
      ),

    jsx_opening_tag: ($) =>
      seq("<", field("name", $.tag_name), repeat($.attribute)),

    jsx_closing_tag: ($) =>
      choice("/>", seq("</", field("name", $.tag_name), ">")),

    tag_name: ($) => /[A-Za-z][A-Za-z0-9]*/,
    attribute: ($) =>
      seq(
        /[A-Za-z][A-Za-z0-9]*/,
        "=",
        /"[^"]*"/, // Quoted string value
      ),
    jsx_content: ($) =>
      choice(
        $.markdown,
        $.jsx_component,
        $.expression, // e.g., {someVar}
      ),

    expression: ($) => seq("{", /[^}]+/, "}"), // Simple placeholder for JS expressions

    inline_jsx: ($) => seq($.jsx_opening_tag, $.jsx_closing_tag),

    markdown: ($) => /[^<{]+/, // Text until a '<' or '{' is encountered
  },
});
