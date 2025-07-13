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
    source_file: ($) =>
      repeat(choice($.jsx_component, $.markdown, $.expression)),

    jsx_component: ($) =>
      seq(
        "<",
        $.identifier, // e.g., Component or div
        repeat($.attribute), // e.g., key="value"
        choice(
          "/>", // Self-closing tag: <Component />
          seq(
            ">",
            repeat($.jsx_content), // Content inside the tag
            "</",
            $.identifier, // Closing tag must match opening
            ">",
          ),
        ),
      ),
    identifier: ($) => /[A-Za-z][A-Za-z0-9]*/,
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

    inline_jsx: ($) =>
      seq(
        "<",
        $.identifier,
        repeat($.attribute),
        choice("/>", seq(">", repeat($.jsx_content), "</", $.identifier, ">")),
      ),

    markdown: ($) => /[^<{]+/, // Text until a '<' or '{' is encountered
  },
});
