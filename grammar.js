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
    document: ($) => repeat(choice($.jsx_element, $.text, $.expression)),

    jsx_element: ($) => choice($._jsx_element, $.jsx_self_closing_element),

    _jsx_element: ($) =>
      seq(
        $.jsx_opening_tag,
        repeat($.text), // Content inside the tag
        $.jsx_closing_tag,
      ),

    jsx_self_closing_element: ($) => seq("<", field("name", $.tag_name), "/>"),

    jsx_opening_tag: ($) => seq("<", optional(field("name", $.tag_name)), ">"),

    jsx_closing_tag: ($) => seq("</", optional(field("name", $.tag_name)), ">"),

    tag_name: ($) => /[A-Za-z][A-Za-z0-9]*/,
    jsx_content: ($) =>
      choice(
        $.text,
        $.jsx_element,
        $.expression, // e.g., {someVar}
      ),

    expression: ($) => seq("{", /[^}]+/, "}"),

    inline_jsx: ($) => seq($.jsx_opening_tag, $.jsx_closing_tag),

    text: ($) => /[^]+/,
  },
});
