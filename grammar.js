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
    document: ($) => repeat(choice($.jsx_element, $.text, $.jsx_expression)),

    // Borrow from tree-sitter-javascript parser
    identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    jsx_element: ($) => choice($._jsx_element, $.jsx_self_closing_element),

    _jsx_element: ($) =>
      seq($.jsx_opening_tag, optional($.jsx_child), $.jsx_closing_tag),

    jsx_self_closing_element: ($) =>
      seq("<", field("name", $.identifier), /[^/]*/, "/>"),

    jsx_opening_tag: ($) =>
      prec.dynamic(
        -1,
        seq("<", optional(seq(field("name", $.identifier), /[^>/]*/)), ">"),
      ),

    jsx_closing_tag: ($) =>
      seq("</", optional(seq(field("name", $.identifier), /[^>]*/)), ">"),

    jsx_identifier: ($) => /[a-zA-Z_$][a-zA-Z\d_$]*-[a-zA-Z\d_$\-]*/,

    jsx_child: ($) =>
      choice(
        $.text,
        $.jsx_element,
        $.jsx_expression, // e.g., {someVar}
      ),

    jsx_expression: ($) => seq("{", /[^}]+/, "}"),

    // inline_jsx: ($) => seq($.jsx_opening_tag, $.jsx_closing_tag),

    text: ($) => /[^<{]+/,
  },
});
