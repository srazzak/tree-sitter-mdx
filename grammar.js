/**
 * @file Tree-sitter grammar for MDX
 * @author Suhail Razzak <suhail.razzak@gmail.com>
 * @license MIT
 * @description Tree-sitter grammar for MDX. Uses JavaScript and Markdown grammars.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
//
const EXTENSION_DEFAULT = !process.env.NO_DEFAULT_EXTENSIONS;
const EXTENSION_GFM =
  process.env.EXTENSION_GFM || EXTENSION_DEFAULT || process.env.ALL_EXTENSIONS;
const EXTENSION_TASK_LIST =
  process.env.EXTENSION_TASK_LIST ||
  EXTENSION_GFM ||
  process.env.ALL_EXTENSIONS;
const EXTENSION_STRIKETHROUGH =
  process.env.EXTENSION_STRIKETHROUGH ||
  EXTENSION_GFM ||
  process.env.ALL_EXTENSIONS;
const EXTENSION_PIPE_TABLE =
  process.env.EXTENSION_PIPE_TABLE ||
  EXTENSION_GFM ||
  process.env.ALL_EXTENSIONS;
const EXTENSION_MINUS_METADATA =
  process.env.EXTENSION_MINUS_METADATA ||
  EXTENSION_DEFAULT ||
  process.env.ALL_EXTENSIONS;
const EXTENSION_PLUS_METADATA =
  process.env.EXTENSION_PLUS_METADATA ||
  EXTENSION_DEFAULT ||
  process.env.ALL_EXTENSIONS;
const EXTENSION_TAGS = process.env.EXTENSION_TAGS || process.env.ALL_EXTENSIONS;
const EXTENSION_LATEX =
  process.env.EXTENSION_LATEX ||
  EXTENSION_DEFAULT ||
  process.env.ALL_EXTENSIONS;
const EXTENSION_WIKI_LINK =
  process.env.EXTENSION_WIKI_LINK || process.env.ALL_EXTENSIONS;

const PUNCTUATION_CHARACTERS_REGEX = "!-/:-@\\[-`\\{-~";
const PUNCTUATION_CHARACTERS_ARRAY = [
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
];

const PRECEDENCE_LEVEL_LINK = 10;

module.exports = grammar({
  name: "mdx",

  externals: ($) => [
    $._automatic_semicolon,
    $._template_chars,
    $._ternary_qmark,
    "||",
    // We use escape sequence and regex pattern to tell the scanner if we're currently inside a string or template string.
    $.escape_sequence,
    $.regex_pattern,
    $.jsx_text,

    // MARKDOWN
    // Quite a few of these tokens could maybe be implemented without use of the external parser.
    // For this the `$._open_block` and `$._close_block` tokens should be used to tell the external
    // parser to put a new anonymous block on the block stack.

    // Block structure gets parsed as follows: After every newline (`$._line_ending`) we try to match
    // as many open blocks as possible. For example if the last line was part of a block quote we look
    // for a `>` at the beginning of the next line. We emit a `$.block_continuation` for each matched
    // block. For this process the external scanner keeps a stack of currently open blocks.
    //
    // If we are not able to match all blocks that does not necessarily mean that all unmatched blocks
    // have to be closed. It could also mean that the line is a lazy continuation line
    // (https://github.github.com/gfm/#lazy-continuation-line, see also `$._split_token` and
    // `$._soft_line_break_marker` below)
    //
    // If a block does get closed (because it was not matched or because some closing token was
    // encountered) we emit a `$._block_close` token

    $._line_ending, // this token does not contain the actual newline characters. see `$._newline`
    $._soft_line_ending,
    $._block_close,
    $.block_continuation,

    // Tokens signifying the start of a block. Blocks that do not need a `$._block_close` because they
    // always span one line are marked as such.

    $._block_quote_start,
    $._indented_chunk_start,
    $.atx_h1_marker, // atx headings do not need a `$._block_close`
    $.atx_h2_marker,
    $.atx_h3_marker,
    $.atx_h4_marker,
    $.atx_h5_marker,
    $.atx_h6_marker,
    $.setext_h1_underline, // setext headings do not need a `$._block_close`
    $.setext_h2_underline,
    $._thematic_break, // thematic breaks do not need a `$._block_close`
    $._list_marker_minus,
    $._list_marker_plus,
    $._list_marker_star,
    $._list_marker_parenthesis,
    $._list_marker_dot,
    $._list_marker_minus_dont_interrupt, // list items that do not interrupt an ongoing paragraph
    $._list_marker_plus_dont_interrupt,
    $._list_marker_star_dont_interrupt,
    $._list_marker_parenthesis_dont_interrupt,
    $._list_marker_dot_dont_interrupt,
    $._fenced_code_block_start_backtick,
    $._fenced_code_block_start_tilde,
    $._blank_line_start, // Does not contain the newline characters. Blank lines do not need a `$._block_close`

    // Special tokens for block structure

    // Closing backticks or tildas for a fenced code block. They are used to trigger a `$._close_block`
    // which in turn will trigger a `$._block_close` at the beginning the following line.
    $._fenced_code_block_end_backtick,
    $._fenced_code_block_end_tilde,

    // Similarly this is used if the closing of a block is not decided by the external parser.
    // A `$._block_close` will be emitted at the beginning of the next line. Notice that a
    // `$._block_close` can also get emitted if the parent block closes.
    $._close_block,

    // This is a workaround so the external parser does not try to open indented blocks when
    // parsing a link reference definition.
    $._no_indented_chunk,

    // An `$._error` token is never valid  and gets emmited to kill invalid parse branches. Concretely
    // this is used to decide wether a newline closes a paragraph and together and it gets emitted
    // when trying to parse the `$._trigger_error` token in `$.link_title`.
    $._error,
    $._trigger_error,
    $._eof,

    $.minus_metadata,
    $.plus_metadata,

    $._pipe_table_start,
    $._pipe_table_line_ending,
  ],

  extras: ($) => [/[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/],

  supertypes: ($) => [
    $.statement,
    $.declaration,
    $.expression,
    $.primary_expression,
    $.pattern,
  ],

  inline: ($) => [
    $._call_signature,
    $._formal_parameter,
    $._expressions,
    $._semicolon,
    $._identifier,
    $._reserved_identifier,
    $._jsx_attribute,
    $._jsx_element_name,
    $._jsx_child,
    $._jsx_element,
    $._jsx_attribute_name,
    $._jsx_attribute_value,
    $._jsx_identifier,
    $._lhs_expression,
  ],

  precedences: ($) => [
    [
      "member",
      "template_call",
      "call",
      $.update_expression,
      "unary_void",
      "binary_exp",
      "binary_times",
      "binary_plus",
      "binary_shift",
      "binary_compare",
      "binary_relation",
      "binary_equality",
      "bitwise_and",
      "bitwise_xor",
      "bitwise_or",
      "logical_and",
      "logical_or",
      "ternary",
      $.sequence_expression,
      $.arrow_function,
    ],
    ["assign", $.primary_expression],
    ["member", "template_call", "new", "call", $.expression],
    ["declaration", "literal"],
    [$.primary_expression, $.statement_block, "object"],
    [$.meta_property, $.import],
    [$.import_statement, $.import],
    [$.export_statement, $.primary_expression],
    [$.lexical_declaration, $.primary_expression],
    [$._setext_heading1, $._block],
    [$._setext_heading2, $._block],
  ],

  conflicts: ($) => [
    // JavaScript
    [$.primary_expression, $._property_name],
    [$.primary_expression, $._property_name, $.arrow_function],
    [$.primary_expression, $.arrow_function],
    [$.primary_expression, $.method_definition],
    [$.primary_expression, $.rest_pattern],
    [$.primary_expression, $.pattern],
    [$.primary_expression, $._for_header],
    [$.variable_declarator, $._for_header],
    [$.array, $.array_pattern],
    [$.object, $.object_pattern],
    [$.assignment_expression, $.pattern],
    [$.assignment_expression, $.object_assignment_pattern],
    [$.labeled_statement, $._property_name],
    [$.computed_property_name, $.array],
    [$.binary_expression, $._initializer],
    [$.class_static_block, $._property_name],
    // Markdown
    [$.link_reference_definition],
    [$.link_label, $._line],
    [$.link_reference_definition, $._line],
  ],

  word: ($) => $.identifier,

  rules: {
    // program: ($) => seq(optional($.hash_bang_line), repeat($.statement)),

    document: ($) =>
      seq(
        optional(
          choice(
            EXTENSION_MINUS_METADATA ? $.minus_metadata : choice(),
            EXTENSION_PLUS_METADATA ? $.plus_metadata : choice(),
          ),
        ),
        alias(prec.right(repeat($._block_not_section)), $.section),
        repeat($.section),
      ),

    // MARKDOWN

    // A backslash escape. This can often be part of different nodes like link labels
    //
    // https://github.github.com/gfm/#backslash-escapes
    backslash_escape: ($) => $._backslash_escape,
    _backslash_escape: ($) =>
      new RegExp("\\\\[" + PUNCTUATION_CHARACTERS_REGEX + "]"),

    // HTML entity and numeric character references.
    //
    // The regex for entity references are build from the html_entities.json file.
    //
    // https://github.github.com/gfm/#entity-and-numeric-character-references
    entity_reference: ($) => html_entity_regex(),
    numeric_character_reference: ($) => /&#([0-9]{1,7}|[xX][0-9a-fA-F]{1,6});/,

    link_label: ($) =>
      seq(
        "[",
        repeat1(
          choice(
            $._text_inline_no_link,
            $.backslash_escape,
            $._soft_line_break,
          ),
        ),
        "]",
      ),

    link_destination: ($) =>
      prec.dynamic(
        PRECEDENCE_LEVEL_LINK,
        choice(
          seq(
            choice(
              // first character is not a '<'
              $._word,
              punctuation_without($, ["<", "(", ")"]),
              $.backslash_escape,
              $._link_destination_parenthesis,
            ),
            repeat(
              choice(
                $._word,
                punctuation_without($, ["(", ")"]),
                $.backslash_escape,
                $._link_destination_parenthesis,
              ),
            ),
          ),
        ),
      ),
    _link_destination_parenthesis: ($) =>
      seq(
        "(",
        repeat(
          choice(
            $._word,
            punctuation_without($, ["(", ")"]),
            $.backslash_escape,
            $._link_destination_parenthesis,
          ),
        ),
        ")",
      ),
    link_title: ($) =>
      choice(
        seq(
          '"',
          repeat(
            choice(
              $._word,
              punctuation_without($, ['"']),
              $._whitespace,
              $.backslash_escape,
              seq(
                $._soft_line_break,
                optional(seq($._soft_line_break, $._trigger_error)),
              ),
            ),
          ),
          '"',
        ),
        seq(
          "'",
          repeat(
            choice(
              $._word,
              punctuation_without($, ["'"]),
              $._whitespace,
              $.backslash_escape,
              seq(
                $._soft_line_break,
                optional(seq($._soft_line_break, $._trigger_error)),
              ),
            ),
          ),
          "'",
        ),
        seq(
          "(",
          repeat(
            choice(
              $._word,
              punctuation_without($, ["(", ")"]),
              $._whitespace,
              $.backslash_escape,
              seq(
                $._soft_line_break,
                optional(seq($._soft_line_break, $._trigger_error)),
              ),
            ),
          ),
          ")",
        ),
      ),

    _newline_token: ($) => /\n|\r\n?/,

    _last_token_punctuation: ($) => choice(), // needed for compatability with common rules

    // BLOCK STRUCTURE

    // All blocks. Every block contains a trailing newline.
    _block: ($) => choice($._block_not_section, $.section),
    _block_not_section: ($) =>
      choice(
        alias($._setext_heading1, $.setext_heading),
        alias($._setext_heading2, $.setext_heading),
        $.import_statement,
        $.export_statement,
        $._jsx_element,
        $.jsx_expression,
        $.paragraph,
        $.block_quote,
        $.thematic_break,
        $.list,
        $.fenced_code_block,
        $._blank_line,
        $.link_reference_definition,
        EXTENSION_PIPE_TABLE ? $.pipe_table : choice(),
      ),
    section: ($) =>
      choice(
        $._section1,
        $._section2,
        $._section3,
        $._section4,
        $._section5,
        $._section6,
      ),
    _section1: ($) =>
      prec.right(
        seq(
          alias($._atx_heading1, $.atx_heading),
          repeat(
            choice(
              alias(
                choice(
                  $._section6,
                  $._section5,
                  $._section4,
                  $._section3,
                  $._section2,
                ),
                $.section,
              ),
              $._block_not_section,
            ),
          ),
        ),
      ),
    _section2: ($) =>
      prec.right(
        seq(
          alias($._atx_heading2, $.atx_heading),
          repeat(
            choice(
              alias(
                choice($._section6, $._section5, $._section4, $._section3),
                $.section,
              ),
              $._block_not_section,
            ),
          ),
        ),
      ),
    _section3: ($) =>
      prec.right(
        seq(
          alias($._atx_heading3, $.atx_heading),
          repeat(
            choice(
              alias(choice($._section6, $._section5, $._section4), $.section),
              $._block_not_section,
            ),
          ),
        ),
      ),
    _section4: ($) =>
      prec.right(
        seq(
          alias($._atx_heading4, $.atx_heading),
          repeat(
            choice(
              alias(choice($._section6, $._section5), $.section),
              $._block_not_section,
            ),
          ),
        ),
      ),
    _section5: ($) =>
      prec.right(
        seq(
          alias($._atx_heading5, $.atx_heading),
          repeat(choice(alias($._section6, $.section), $._block_not_section)),
        ),
      ),
    _section6: ($) =>
      prec.right(
        seq(
          alias($._atx_heading6, $.atx_heading),
          repeat($._block_not_section),
        ),
      ),

    // LEAF BLOCKS

    // A thematic break. This is currently handled by the external scanner but maybe could be
    // parsed using normal tree-sitter rules.
    //
    // https://github.github.com/gfm/#thematic-breaks
    thematic_break: ($) => seq($._thematic_break, choice($._newline, $._eof)),

    // An ATX heading. This is currently handled by the external scanner but maybe could be
    // parsed using normal tree-sitter rules.
    //
    // https://github.github.com/gfm/#atx-headings
    _atx_heading1: ($) =>
      prec(
        1,
        seq($.atx_h1_marker, optional($._atx_heading_content), $._newline),
      ),
    _atx_heading2: ($) =>
      prec(
        1,
        seq($.atx_h2_marker, optional($._atx_heading_content), $._newline),
      ),
    _atx_heading3: ($) =>
      prec(
        1,
        seq($.atx_h3_marker, optional($._atx_heading_content), $._newline),
      ),
    _atx_heading4: ($) =>
      prec(
        1,
        seq($.atx_h4_marker, optional($._atx_heading_content), $._newline),
      ),
    _atx_heading5: ($) =>
      prec(
        1,
        seq($.atx_h5_marker, optional($._atx_heading_content), $._newline),
      ),
    _atx_heading6: ($) =>
      prec(
        1,
        seq($.atx_h6_marker, optional($._atx_heading_content), $._newline),
      ),
    _atx_heading_content: ($) =>
      prec(
        1,
        seq(
          optional($._whitespace),
          field("heading_content", alias($._line, $.markdown_inline)),
        ),
      ),

    // A setext heading. The underlines are currently handled by the external scanner but maybe
    // could be parsed using normal tree-sitter rules.
    //
    // https://github.github.com/gfm/#setext-headings
    _setext_heading1: ($) =>
      seq(
        field("heading_content", $.paragraph),
        $.setext_h1_underline,
        choice($._newline, $._eof),
      ),
    _setext_heading2: ($) =>
      seq(
        field("heading_content", $.paragraph),
        $.setext_h2_underline,
        choice($._newline, $._eof),
      ),

    _indented_chunk: ($) =>
      seq(
        $._indented_chunk_start,
        repeat(choice($._line, $._newline)),
        $._block_close,
        optional($.block_continuation),
      ),

    // A fenced code block. Fenced code blocks are mainly handled by the external scanner. In
    // case of backtick code blocks the external scanner also checks that the info string is
    // proper.
    //
    // https://github.github.com/gfm/#fenced-code-blocks
    fenced_code_block: ($) =>
      prec.right(
        choice(
          seq(
            alias(
              $._fenced_code_block_start_backtick,
              $.fenced_code_block_delimiter,
            ),
            optional($._whitespace),
            optional($.info_string),
            $._newline,
            optional($.code_fence_content),
            optional(
              seq(
                alias(
                  $._fenced_code_block_end_backtick,
                  $.fenced_code_block_delimiter,
                ),
                $._close_block,
                $._newline,
              ),
            ),
            $._block_close,
          ),
          seq(
            alias(
              $._fenced_code_block_start_tilde,
              $.fenced_code_block_delimiter,
            ),
            optional($._whitespace),
            optional($.info_string),
            $._newline,
            optional($.code_fence_content),
            optional(
              seq(
                alias(
                  $._fenced_code_block_end_tilde,
                  $.fenced_code_block_delimiter,
                ),
                $._close_block,
                $._newline,
              ),
            ),
            $._block_close,
          ),
        ),
      ),
    code_fence_content: ($) => repeat1(choice($._newline, $._line)),
    info_string: ($) =>
      choice(
        seq(
          $.language,
          repeat(
            choice(
              $._line,
              $.backslash_escape,
              $.entity_reference,
              $.numeric_character_reference,
            ),
          ),
        ),
        seq(
          repeat1(choice("{", "}")),
          optional(
            choice(
              seq(
                $.language,
                repeat(
                  choice(
                    $._line,
                    $.backslash_escape,
                    $.entity_reference,
                    $.numeric_character_reference,
                  ),
                ),
              ),
              seq(
                $._whitespace,
                repeat(
                  choice(
                    $._line,
                    $.backslash_escape,
                    $.entity_reference,
                    $.numeric_character_reference,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    language: ($) =>
      prec.right(
        repeat1(
          choice(
            $._word,
            punctuation_without($, ["{", "}", ","]),
            $.backslash_escape,
            $.entity_reference,
            $.numeric_character_reference,
          ),
        ),
      ),

    // A link reference definition. We need to make sure that this is not mistaken for a
    // paragraph or indented chunk. The `$._no_indented_chunk` token is used to tell the
    // external scanner not to allow indented chunks when the `$.link_title` of the link
    // reference definition would be valid.
    //
    // https://github.github.com/gfm/#link-reference-definitions
    link_reference_definition: ($) =>
      prec.dynamic(
        PRECEDENCE_LEVEL_LINK,
        seq(
          optional($._whitespace),
          $.link_label,
          ":",
          optional(
            seq(
              optional($._whitespace),
              optional(seq($._soft_line_break, optional($._whitespace))),
            ),
          ),
          $.link_destination,
          optional(
            prec.dynamic(
              2 * PRECEDENCE_LEVEL_LINK,
              seq(
                choice(
                  seq(
                    $._whitespace,
                    optional(seq($._soft_line_break, optional($._whitespace))),
                  ),
                  seq($._soft_line_break, optional($._whitespace)),
                ),
                optional($._no_indented_chunk),
                $.link_title,
              ),
            ),
          ),
          choice($._newline, $._soft_line_break, $._eof),
        ),
      ),
    _text_inline_no_link: ($) =>
      choice($._word, $._whitespace, punctuation_without($, ["[", "]"])),

    // A paragraph. The parsing tactic for deciding when a paragraph ends is as follows:
    // on every newline inside a paragraph a conflict is triggered manually using
    // `$._split_token` to split the parse state into two branches.
    //
    // One of them - the one that also contains a `$._soft_line_break_marker` will try to
    // continue the paragraph, but we make sure that the beginning of a new block that can
    // interrupt a paragraph can also be parsed. If this is the case we know that the paragraph
    // should have been closed and the external parser will emit an `$._error` to kill the parse
    // branch.
    //
    // The other parse branch consideres the paragraph to be over. It will be killed if no valid new
    // block is detected before the next newline.
    //
    // Either way, after the next newline only one branch will exist, so the ammount of branches
    // related to paragraphs ending does not grow.
    //
    // https://github.github.com/gfm/#paragraphs
    paragraph: ($) =>
      seq(
        alias(repeat1(choice($._line, $._soft_line_break)), $.markdown_inline),
        choice($._newline, $._eof),
      ),

    // A blank line including the following newline.
    //
    // https://github.github.com/gfm/#blank-lines
    _blank_line: ($) => seq($._blank_line_start, choice($._newline, $._eof)),

    // CONTAINER BLOCKS

    // A block quote. This is the most basic example of a container block handled by the
    // external scanner.
    //
    // https://github.github.com/gfm/#block-quotes
    block_quote: ($) =>
      seq(
        alias($._block_quote_start, $.block_quote_marker),
        optional($.block_continuation),
        repeat($._block),
        $._block_close,
        optional($.block_continuation),
      ),

    // A list. This grammar does not differentiate between loose and tight lists for efficiency
    // reasons.
    //
    // Lists can only contain list items with list markers of the same type. List items are
    // handled by the external scanner.
    //
    // https://github.github.com/gfm/#lists
    list: ($) =>
      prec.right(
        choice(
          $._list_plus,
          $._list_minus,
          $._list_star,
          $._list_dot,
          $._list_parenthesis,
        ),
      ),
    _list_plus: ($) =>
      prec.right(repeat1(alias($._list_item_plus, $.list_item))),
    _list_minus: ($) =>
      prec.right(repeat1(alias($._list_item_minus, $.list_item))),
    _list_star: ($) =>
      prec.right(repeat1(alias($._list_item_star, $.list_item))),
    _list_dot: ($) => prec.right(repeat1(alias($._list_item_dot, $.list_item))),
    _list_parenthesis: ($) =>
      prec.right(repeat1(alias($._list_item_parenthesis, $.list_item))),
    // Some list items can not interrupt a paragraph and are marked as such by the external
    // scanner.
    list_marker_plus: ($) =>
      choice($._list_marker_plus, $._list_marker_plus_dont_interrupt),
    list_marker_minus: ($) =>
      choice($._list_marker_minus, $._list_marker_minus_dont_interrupt),
    list_marker_star: ($) =>
      choice($._list_marker_star, $._list_marker_star_dont_interrupt),
    list_marker_dot: ($) =>
      choice($._list_marker_dot, $._list_marker_dot_dont_interrupt),
    list_marker_parenthesis: ($) =>
      choice(
        $._list_marker_parenthesis,
        $._list_marker_parenthesis_dont_interrupt,
      ),
    _list_item_plus: ($) =>
      seq(
        $.list_marker_plus,
        optional($.block_continuation),
        $._list_item_content,
        $._block_close,
        optional($.block_continuation),
      ),
    _list_item_minus: ($) =>
      seq(
        $.list_marker_minus,
        optional($.block_continuation),
        $._list_item_content,
        $._block_close,
        optional($.block_continuation),
      ),
    _list_item_star: ($) =>
      seq(
        $.list_marker_star,
        optional($.block_continuation),
        $._list_item_content,
        $._block_close,
        optional($.block_continuation),
      ),
    _list_item_dot: ($) =>
      seq(
        $.list_marker_dot,
        optional($.block_continuation),
        $._list_item_content,
        $._block_close,
        optional($.block_continuation),
      ),
    _list_item_parenthesis: ($) =>
      seq(
        $.list_marker_parenthesis,
        optional($.block_continuation),
        $._list_item_content,
        $._block_close,
        optional($.block_continuation),
      ),
    // List items are closed after two consecutive blank lines
    _list_item_content: ($) =>
      choice(
        prec(
          1,
          seq(
            $._blank_line,
            $._blank_line,
            $._close_block,
            optional($.block_continuation),
          ),
        ),
        repeat1($._block),
        EXTENSION_TASK_LIST
          ? prec(
              1,
              seq(
                choice(
                  $.task_list_marker_checked,
                  $.task_list_marker_unchecked,
                ),
                $._whitespace,
                $.paragraph,
                repeat($._block),
              ),
            )
          : choice(),
      ),

    // Newlines as in the spec. Parsing a newline triggers the matching process by making
    // the external parser emit a `$._line_ending`.
    _newline: ($) => seq($._line_ending, optional($.block_continuation)),
    _soft_line_break: ($) =>
      seq($._soft_line_ending, optional($.block_continuation)),
    // Some symbols get parsed as single tokens so that html blocks get detected properly
    _line: ($) =>
      prec.right(
        repeat1(
          choice($._word, $._whitespace, punctuation_without($, ["<", "{"])),
        ),
      ),
    _word: ($) =>
      choice(
        new RegExp("[^" + PUNCTUATION_CHARACTERS_REGEX + " \\t\\n\\r]+"),
        EXTENSION_TASK_LIST ? choice(/\[[xX]\]/, /\[[ \t]\]/) : choice(),
      ),
    // The external scanner emits some characters that should just be ignored.
    _whitespace: ($) => /[ \t]+/,

    ...(EXTENSION_TASK_LIST
      ? {
          task_list_marker_checked: ($) => prec(1, /\[[xX]\]/),
          task_list_marker_unchecked: ($) => prec(1, /\[[ \t]\]/),
        }
      : {}),

    ...(EXTENSION_PIPE_TABLE
      ? {
          pipe_table: ($) =>
            prec.right(
              seq(
                $._pipe_table_start,
                alias($.pipe_table_row, $.pipe_table_header),
                $._newline,
                $.pipe_table_delimiter_row,
                repeat(seq($._pipe_table_newline, optional($.pipe_table_row))),
                choice($._newline, $._eof),
              ),
            ),

          _pipe_table_newline: ($) =>
            seq($._pipe_table_line_ending, optional($.block_continuation)),

          pipe_table_delimiter_row: ($) =>
            seq(
              optional(seq(optional($._whitespace), "|")),
              repeat1(
                prec.right(
                  seq(
                    optional($._whitespace),
                    $.pipe_table_delimiter_cell,
                    optional($._whitespace),
                    "|",
                  ),
                ),
              ),
              optional($._whitespace),
              optional(
                seq($.pipe_table_delimiter_cell, optional($._whitespace)),
              ),
            ),

          pipe_table_delimiter_cell: ($) =>
            seq(
              optional(alias(":", $.pipe_table_align_left)),
              repeat1("-"),
              optional(alias(":", $.pipe_table_align_right)),
            ),

          pipe_table_row: ($) =>
            seq(
              optional(seq(optional($._whitespace), "|")),
              choice(
                seq(
                  repeat1(
                    prec.right(
                      seq(
                        choice(
                          seq(
                            optional($._whitespace),
                            $.pipe_table_cell,
                            optional($._whitespace),
                          ),
                          alias($._whitespace, $.pipe_table_cell),
                        ),
                        "|",
                      ),
                    ),
                  ),
                  optional($._whitespace),
                  optional(seq($.pipe_table_cell, optional($._whitespace))),
                ),
                seq(
                  optional($._whitespace),
                  $.pipe_table_cell,
                  optional($._whitespace),
                ),
              ),
            ),

          pipe_table_cell: ($) =>
            prec.right(
              seq(
                choice(
                  $._word,
                  $._backslash_escape,
                  punctuation_without($, ["|"]),
                ),
                repeat(
                  choice(
                    $._word,
                    $._whitespace,
                    $._backslash_escape,
                    punctuation_without($, ["|"]),
                  ),
                ),
              ),
            ),
        }
      : {}),

    // JAVASCRIPT
    hash_bang_line: (_) => /#!.*/,

    //
    // Export declarations
    //

    export_statement: ($) =>
      choice(
        seq(
          "export",
          choice(
            seq("*", $._from_clause),
            seq($.namespace_export, $._from_clause),
            seq($.export_clause, $._from_clause),
            $.export_clause,
          ),
          $._semicolon,
        ),
        seq(
          repeat(field("decorator", $.decorator)),
          "export",
          choice(
            field("declaration", $.declaration),
            seq(
              "default",
              choice(
                field("declaration", $.declaration),
                seq(field("value", $.expression), $._semicolon),
              ),
            ),
          ),
        ),
      ),

    namespace_export: ($) => seq("*", "as", $._module_export_name),

    export_clause: ($) =>
      seq("{", commaSep($.export_specifier), optional(","), "}"),

    export_specifier: ($) =>
      seq(
        field("name", $._module_export_name),
        optional(seq("as", field("alias", $._module_export_name))),
      ),

    _module_export_name: ($) => choice($.identifier, $.string),

    declaration: ($) =>
      choice(
        $.function_declaration,
        $.generator_function_declaration,
        $.class_declaration,
        $.lexical_declaration,
        $.variable_declaration,
      ),

    //
    // Import declarations
    //

    import: (_) => token("import"),

    import_statement: ($) =>
      seq(
        "import",
        choice(seq($.import_clause, $._from_clause), field("source", $.string)),
        optional($.import_attribute),
        $._semicolon,
      ),

    import_clause: ($) =>
      choice(
        $.namespace_import,
        $.named_imports,
        seq(
          $.identifier,
          optional(seq(",", choice($.namespace_import, $.named_imports))),
        ),
      ),

    _from_clause: ($) => seq("from", field("source", $.string)),

    namespace_import: ($) => seq("*", "as", $.identifier),

    named_imports: ($) =>
      seq("{", commaSep($.import_specifier), optional(","), "}"),

    import_specifier: ($) =>
      choice(
        field("name", $.identifier),
        seq(
          field("name", $._module_export_name),
          "as",
          field("alias", $.identifier),
        ),
      ),

    import_attribute: ($) => seq("with", $.object),

    //
    // Statements
    //

    statement: ($) =>
      choice(
        $.export_statement,
        $.import_statement,
        $.debugger_statement,
        $.expression_statement,
        $.declaration,
        $.statement_block,

        $.if_statement,
        $.switch_statement,
        $.for_statement,
        $.for_in_statement,
        $.while_statement,
        $.do_statement,
        $.try_statement,
        $.with_statement,

        $.break_statement,
        $.continue_statement,
        $.return_statement,
        $.throw_statement,
        $.empty_statement,
        $.labeled_statement,
      ),

    expression_statement: ($) => seq($._expressions, $._semicolon),

    variable_declaration: ($) =>
      seq("var", commaSep1($.variable_declarator), $._semicolon),

    lexical_declaration: ($) =>
      seq(
        field("kind", choice("let", "const")),
        commaSep1($.variable_declarator),
        $._semicolon,
      ),

    variable_declarator: ($) =>
      seq(
        field("name", choice($.identifier, $._destructuring_pattern)),
        optional($._initializer),
      ),

    statement_block: ($) =>
      prec.right(
        seq("{", repeat($.statement), "}", optional($._automatic_semicolon)),
      ),

    else_clause: ($) => seq("else", $.statement),

    if_statement: ($) =>
      prec.right(
        seq(
          "if",
          field("condition", $.parenthesized_expression),
          field("consequence", $.statement),
          optional(field("alternative", $.else_clause)),
        ),
      ),

    switch_statement: ($) =>
      seq(
        "switch",
        field("value", $.parenthesized_expression),
        field("body", $.switch_body),
      ),

    for_statement: ($) =>
      seq(
        "for",
        "(",
        choice(
          field(
            "initializer",
            choice($.lexical_declaration, $.variable_declaration),
          ),
          seq(field("initializer", $._expressions), ";"),
          field("initializer", $.empty_statement),
        ),
        field("condition", choice(seq($._expressions, ";"), $.empty_statement)),
        field("increment", optional($._expressions)),
        ")",
        field("body", $.statement),
      ),

    for_in_statement: ($) =>
      seq("for", optional("await"), $._for_header, field("body", $.statement)),

    _for_header: ($) =>
      seq(
        "(",
        choice(
          field("left", choice($._lhs_expression, $.parenthesized_expression)),
          seq(
            field("kind", "var"),
            field("left", choice($.identifier, $._destructuring_pattern)),
            optional($._initializer),
          ),
          seq(
            field("kind", choice("let", "const")),
            field("left", choice($.identifier, $._destructuring_pattern)),
            optional($._automatic_semicolon),
          ),
        ),
        field("operator", choice("in", "of")),
        field("right", $._expressions),
        ")",
      ),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $.parenthesized_expression),
        field("body", $.statement),
      ),

    do_statement: ($) =>
      prec.right(
        seq(
          "do",
          field("body", $.statement),
          "while",
          field("condition", $.parenthesized_expression),
          optional($._semicolon),
        ),
      ),

    try_statement: ($) =>
      seq(
        "try",
        field("body", $.statement_block),
        optional(field("handler", $.catch_clause)),
        optional(field("finalizer", $.finally_clause)),
      ),

    with_statement: ($) =>
      seq(
        "with",
        field("object", $.parenthesized_expression),
        field("body", $.statement),
      ),

    break_statement: ($) =>
      seq(
        "break",
        field("label", optional(alias($.identifier, $.statement_identifier))),
        $._semicolon,
      ),

    continue_statement: ($) =>
      seq(
        "continue",
        field("label", optional(alias($.identifier, $.statement_identifier))),
        $._semicolon,
      ),

    debugger_statement: ($) => seq("debugger", $._semicolon),

    return_statement: ($) =>
      seq("return", optional($._expressions), $._semicolon),

    throw_statement: ($) => seq("throw", $._expressions, $._semicolon),

    empty_statement: (_) => ";",

    labeled_statement: ($) =>
      prec.dynamic(
        -1,
        seq(
          field(
            "label",
            alias(
              choice($.identifier, $._reserved_identifier),
              $.statement_identifier,
            ),
          ),
          ":",
          field("body", $.statement),
        ),
      ),

    //
    // Statement components
    //

    switch_body: ($) =>
      seq("{", repeat(choice($.switch_case, $.switch_default)), "}"),

    switch_case: ($) =>
      seq(
        "case",
        field("value", $._expressions),
        ":",
        field("body", repeat($.statement)),
      ),

    switch_default: ($) =>
      seq("default", ":", field("body", repeat($.statement))),

    catch_clause: ($) =>
      seq(
        "catch",
        optional(
          seq(
            "(",
            field("parameter", choice($.identifier, $._destructuring_pattern)),
            ")",
          ),
        ),
        field("body", $.statement_block),
      ),

    finally_clause: ($) => seq("finally", field("body", $.statement_block)),

    parenthesized_expression: ($) => seq("(", $._expressions, ")"),

    //
    // Expressions
    //
    _expressions: ($) => choice($.expression, $.sequence_expression),

    expression: ($) =>
      choice(
        $.primary_expression,
        $._jsx_element,
        $.assignment_expression,
        $.augmented_assignment_expression,
        $.await_expression,
        $.unary_expression,
        $.binary_expression,
        $.ternary_expression,
        $.update_expression,
        $.new_expression,
        $.yield_expression,
      ),

    primary_expression: ($) =>
      choice(
        $.subscript_expression,
        $.member_expression,
        $.parenthesized_expression,
        $._identifier,
        alias($._reserved_identifier, $.identifier),
        $.this,
        $.super,
        $.number,
        $.string,
        $.template_string,
        $.regex,
        $.true,
        $.false,
        $.null,
        $.object,
        $.array,
        $.function_expression,
        $.arrow_function,
        $.generator_function,
        $.class,
        $.meta_property,
        $.call_expression,
      ),

    yield_expression: ($) =>
      prec.right(
        seq("yield", choice(seq("*", $.expression), optional($.expression))),
      ),

    object: ($) =>
      prec(
        "object",
        seq(
          "{",
          commaSep(
            optional(
              choice(
                $.pair,
                $.spread_element,
                $.method_definition,
                alias(
                  choice($.identifier, $._reserved_identifier),
                  $.shorthand_property_identifier,
                ),
              ),
            ),
          ),
          "}",
        ),
      ),

    object_pattern: ($) =>
      prec(
        "object",
        seq(
          "{",
          commaSep(
            optional(
              choice(
                $.pair_pattern,
                $.rest_pattern,
                $.object_assignment_pattern,
                alias(
                  choice($.identifier, $._reserved_identifier),
                  $.shorthand_property_identifier_pattern,
                ),
              ),
            ),
          ),
          "}",
        ),
      ),

    assignment_pattern: ($) =>
      seq(field("left", $.pattern), "=", field("right", $.expression)),

    object_assignment_pattern: ($) =>
      seq(
        field(
          "left",
          choice(
            alias(
              choice($._reserved_identifier, $.identifier),
              $.shorthand_property_identifier_pattern,
            ),
            $._destructuring_pattern,
          ),
        ),
        "=",
        field("right", $.expression),
      ),

    array: ($) =>
      seq("[", commaSep(optional(choice($.expression, $.spread_element))), "]"),

    array_pattern: ($) =>
      seq(
        "[",
        commaSep(optional(choice($.pattern, $.assignment_pattern))),
        "]",
      ),

    _jsx_element: ($) => choice($.jsx_element, $.jsx_self_closing_element),

    jsx_element: ($) =>
      seq(
        field("open_tag", $.jsx_opening_element),
        repeat($._jsx_child),
        field("close_tag", $.jsx_closing_element),
      ),

    // An entity can be named, numeric (decimal), or numeric (hexadecimal). The
    // longest entity name is 29 characters long, and the HTML spec says that
    // no more will ever be added.
    html_character_reference: (_) =>
      /&(#([xX][0-9a-fA-F]{1,6}|[0-9]{1,5})|[A-Za-z]{1,30});/,

    jsx_expression: ($) =>
      seq(
        "{",
        optional(choice($.expression, $.sequence_expression, $.spread_element)),
        "}",
      ),

    _jsx_child: ($) =>
      choice(
        $.jsx_text,
        $.html_character_reference,
        $._jsx_element,
        $.jsx_expression,
      ),

    jsx_opening_element: ($) =>
      prec.dynamic(
        -1,
        seq(
          "<",
          optional(
            seq(
              field("name", $._jsx_element_name),
              repeat(field("attribute", $._jsx_attribute)),
            ),
          ),
          ">",
        ),
      ),

    jsx_identifier: (_) => /[a-zA-Z_$][a-zA-Z\d_$]*-[a-zA-Z\d_$\-]*/,

    _jsx_identifier: ($) =>
      choice(alias($.jsx_identifier, $.identifier), $.identifier),

    nested_identifier: ($) =>
      prec(
        "member",
        seq(
          field(
            "object",
            choice(
              $.identifier,
              alias($.nested_identifier, $.member_expression),
            ),
          ),
          ".",
          field("property", alias($.identifier, $.property_identifier)),
        ),
      ),

    jsx_namespace_name: ($) => seq($._jsx_identifier, ":", $._jsx_identifier),

    _jsx_element_name: ($) =>
      choice(
        $._jsx_identifier,
        alias($.nested_identifier, $.member_expression),
        $.jsx_namespace_name,
      ),

    jsx_closing_element: ($) =>
      seq("</", optional(field("name", $._jsx_element_name)), ">"),

    jsx_self_closing_element: ($) =>
      seq(
        "<",
        field("name", $._jsx_element_name),
        repeat(field("attribute", $._jsx_attribute)),
        "/>",
      ),

    _jsx_attribute: ($) => choice($.jsx_attribute, $.jsx_expression),

    _jsx_attribute_name: ($) =>
      choice(
        alias($._jsx_identifier, $.property_identifier),
        $.jsx_namespace_name,
      ),

    jsx_attribute: ($) =>
      seq($._jsx_attribute_name, optional(seq("=", $._jsx_attribute_value))),

    _jsx_string: ($) =>
      choice(
        seq(
          '"',
          repeat(
            choice(
              alias($.unescaped_double_jsx_string_fragment, $.string_fragment),
              $.html_character_reference,
            ),
          ),
          '"',
        ),
        seq(
          "'",
          repeat(
            choice(
              alias($.unescaped_single_jsx_string_fragment, $.string_fragment),
              $.html_character_reference,
            ),
          ),
          "'",
        ),
      ),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token() constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    unescaped_double_jsx_string_fragment: (_) =>
      token.immediate(prec(1, /([^"&]|&[^#A-Za-z])+/)),

    // same here
    unescaped_single_jsx_string_fragment: (_) =>
      token.immediate(prec(1, /([^'&]|&[^#A-Za-z])+/)),

    _jsx_attribute_value: ($) =>
      choice(alias($._jsx_string, $.string), $.jsx_expression, $._jsx_element),

    class: ($) =>
      prec(
        "literal",
        seq(
          repeat(field("decorator", $.decorator)),
          "class",
          field("name", optional($.identifier)),
          optional($.class_heritage),
          field("body", $.class_body),
        ),
      ),

    class_declaration: ($) =>
      prec(
        "declaration",
        seq(
          repeat(field("decorator", $.decorator)),
          "class",
          field("name", $.identifier),
          optional($.class_heritage),
          field("body", $.class_body),
          optional($._automatic_semicolon),
        ),
      ),

    class_heritage: ($) => seq("extends", $.expression),

    function_expression: ($) =>
      prec(
        "literal",
        seq(
          optional("async"),
          "function",
          field("name", optional($.identifier)),
          $._call_signature,
          field("body", $.statement_block),
        ),
      ),

    function_declaration: ($) =>
      prec.right(
        "declaration",
        seq(
          optional("async"),
          "function",
          field("name", $.identifier),
          $._call_signature,
          field("body", $.statement_block),
          optional($._automatic_semicolon),
        ),
      ),

    generator_function: ($) =>
      prec(
        "literal",
        seq(
          optional("async"),
          "function",
          "*",
          field("name", optional($.identifier)),
          $._call_signature,
          field("body", $.statement_block),
        ),
      ),

    generator_function_declaration: ($) =>
      prec.right(
        "declaration",
        seq(
          optional("async"),
          "function",
          "*",
          field("name", $.identifier),
          $._call_signature,
          field("body", $.statement_block),
          optional($._automatic_semicolon),
        ),
      ),

    arrow_function: ($) =>
      seq(
        optional("async"),
        choice(
          field(
            "parameter",
            choice(alias($._reserved_identifier, $.identifier), $.identifier),
          ),
          $._call_signature,
        ),
        "=>",
        field("body", choice($.expression, $.statement_block)),
      ),

    // Override
    _call_signature: ($) => field("parameters", $.formal_parameters),
    _formal_parameter: ($) => choice($.pattern, $.assignment_pattern),

    optional_chain: (_) => "?.",

    call_expression: ($) =>
      choice(
        prec(
          "call",
          seq(
            field("function", choice($.expression, $.import)),
            field("arguments", $.arguments),
          ),
        ),
        prec(
          "template_call",
          seq(
            field("function", choice($.primary_expression, $.new_expression)),
            field("arguments", $.template_string),
          ),
        ),
        prec(
          "member",
          seq(
            field("function", $.primary_expression),
            field("optional_chain", $.optional_chain),
            field("arguments", $.arguments),
          ),
        ),
      ),

    new_expression: ($) =>
      prec.right(
        "new",
        seq(
          "new",
          field("constructor", choice($.primary_expression, $.new_expression)),
          field("arguments", optional(prec.dynamic(1, $.arguments))),
        ),
      ),

    await_expression: ($) => prec("unary_void", seq("await", $.expression)),

    member_expression: ($) =>
      prec(
        "member",
        seq(
          field("object", choice($.expression, $.primary_expression, $.import)),
          choice(".", field("optional_chain", $.optional_chain)),
          field(
            "property",
            choice(
              $.private_property_identifier,
              alias($.identifier, $.property_identifier),
            ),
          ),
        ),
      ),

    subscript_expression: ($) =>
      prec.right(
        "member",
        seq(
          field("object", choice($.expression, $.primary_expression)),
          optional(field("optional_chain", $.optional_chain)),
          "[",
          field("index", $._expressions),
          "]",
        ),
      ),

    _lhs_expression: ($) =>
      choice(
        $.member_expression,
        $.subscript_expression,
        $._identifier,
        alias($._reserved_identifier, $.identifier),
        $._destructuring_pattern,
      ),

    assignment_expression: ($) =>
      prec.right(
        "assign",
        seq(
          field("left", choice($.parenthesized_expression, $._lhs_expression)),
          "=",
          field("right", $.expression),
        ),
      ),

    _augmented_assignment_lhs: ($) =>
      choice(
        $.member_expression,
        $.subscript_expression,
        alias($._reserved_identifier, $.identifier),
        $.identifier,
        $.parenthesized_expression,
      ),

    augmented_assignment_expression: ($) =>
      prec.right(
        "assign",
        seq(
          field("left", $._augmented_assignment_lhs),
          field(
            "operator",
            choice(
              "+=",
              "-=",
              "*=",
              "/=",
              "%=",
              "^=",
              "&=",
              "|=",
              ">>=",
              ">>>=",
              "<<=",
              "**=",
              "&&=",
              "||=",
              "??=",
            ),
          ),
          field("right", $.expression),
        ),
      ),

    _initializer: ($) => seq("=", field("value", $.expression)),

    _destructuring_pattern: ($) => choice($.object_pattern, $.array_pattern),

    spread_element: ($) => seq("...", $.expression),

    ternary_expression: ($) =>
      prec.right(
        "ternary",
        seq(
          field("condition", $.expression),
          alias($._ternary_qmark, "?"),
          field("consequence", $.expression),
          ":",
          field("alternative", $.expression),
        ),
      ),

    binary_expression: ($) =>
      choice(
        ...[
          ["&&", "logical_and"],
          ["||", "logical_or"],
          [">>", "binary_shift"],
          [">>>", "binary_shift"],
          ["<<", "binary_shift"],
          ["&", "bitwise_and"],
          ["^", "bitwise_xor"],
          ["|", "bitwise_or"],
          ["+", "binary_plus"],
          ["-", "binary_plus"],
          ["*", "binary_times"],
          ["/", "binary_times"],
          ["%", "binary_times"],
          ["**", "binary_exp", "right"],
          ["<", "binary_relation"],
          ["<=", "binary_relation"],
          ["==", "binary_equality"],
          ["===", "binary_equality"],
          ["!=", "binary_equality"],
          ["!==", "binary_equality"],
          [">=", "binary_relation"],
          [">", "binary_relation"],
          ["??", "ternary"],
          ["instanceof", "binary_relation"],
          ["in", "binary_relation"],
        ].map(([operator, precedence, associativity]) =>
          (associativity === "right" ? prec.right : prec.left)(
            precedence,
            seq(
              field(
                "left",
                operator === "in"
                  ? choice($.expression, $.private_property_identifier)
                  : $.expression,
              ),
              field("operator", operator),
              field("right", $.expression),
            ),
          ),
        ),
      ),

    unary_expression: ($) =>
      prec.left(
        "unary_void",
        seq(
          field(
            "operator",
            choice("!", "~", "-", "+", "typeof", "void", "delete"),
          ),
          field("argument", $.expression),
        ),
      ),

    update_expression: ($) =>
      prec.left(
        choice(
          seq(
            field("argument", $.expression),
            field("operator", choice("++", "--")),
          ),
          seq(
            field("operator", choice("++", "--")),
            field("argument", $.expression),
          ),
        ),
      ),

    sequence_expression: ($) => prec.right(commaSep1($.expression)),

    //
    // Primitives
    //

    string: ($) =>
      choice(
        seq(
          '"',
          repeat(
            choice(
              alias($.unescaped_double_string_fragment, $.string_fragment),
              $.escape_sequence,
            ),
          ),
          '"',
        ),
        seq(
          "'",
          repeat(
            choice(
              alias($.unescaped_single_string_fragment, $.string_fragment),
              $.escape_sequence,
            ),
          ),
          "'",
        ),
      ),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token() constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    unescaped_double_string_fragment: (_) =>
      token.immediate(prec(1, /[^"\\\r\n]+/)),

    // same here
    unescaped_single_string_fragment: (_) =>
      token.immediate(prec(1, /[^'\\\r\n]+/)),

    escape_sequence: (_) =>
      token.immediate(
        seq(
          "\\",
          choice(
            /[^xu0-7]/,
            /[0-7]{1,3}/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
            /[\r?][\n\u2028\u2029]/,
          ),
        ),
      ),

    template_string: ($) =>
      seq(
        "`",
        repeat(
          choice(
            alias($._template_chars, $.string_fragment),
            $.escape_sequence,
            $.template_substitution,
          ),
        ),
        "`",
      ),

    template_substitution: ($) => seq("${", $._expressions, "}"),

    regex: ($) =>
      seq(
        "/",
        field("pattern", $.regex_pattern),
        token.immediate(prec(1, "/")),
        optional(field("flags", $.regex_flags)),
      ),

    regex_pattern: (_) =>
      token.immediate(
        prec(
          -1,
          repeat1(
            choice(
              seq(
                "[",
                repeat(
                  choice(
                    seq("\\", /./), // escaped character
                    /[^\]\n\\]/, // any character besides ']' or '\n'
                  ),
                ),
                "]",
              ), // square-bracket-delimited character class
              seq("\\", /./), // escaped character
              /[^/\\\[\n]/, // any character besides '[', '\', '/', '\n'
            ),
          ),
        ),
      ),

    regex_flags: (_) => token.immediate(/[a-z]+/),

    number: (_) => {
      const hexLiteral = seq(choice("0x", "0X"), /[\da-fA-F](_?[\da-fA-F])*/);

      const decimalDigits = /\d(_?\d)*/;
      const signedInteger = seq(optional(choice("-", "+")), decimalDigits);
      const exponentPart = seq(choice("e", "E"), signedInteger);

      const binaryLiteral = seq(choice("0b", "0B"), /[0-1](_?[0-1])*/);

      const octalLiteral = seq(choice("0o", "0O"), /[0-7](_?[0-7])*/);

      const bigintLiteral = seq(
        choice(hexLiteral, binaryLiteral, octalLiteral, decimalDigits),
        "n",
      );

      const decimalIntegerLiteral = choice(
        "0",
        seq(
          optional("0"),
          /[1-9]/,
          optional(seq(optional("_"), decimalDigits)),
        ),
      );

      const decimalLiteral = choice(
        seq(
          decimalIntegerLiteral,
          ".",
          optional(decimalDigits),
          optional(exponentPart),
        ),
        seq(".", decimalDigits, optional(exponentPart)),
        seq(decimalIntegerLiteral, exponentPart),
        decimalDigits,
      );

      return token(
        choice(
          hexLiteral,
          decimalLiteral,
          binaryLiteral,
          octalLiteral,
          bigintLiteral,
        ),
      );
    },

    // 'undefined' is syntactically a regular identifier in JavaScript.
    // However, its main use is as the read-only global variable whose
    // value is [undefined], for which there's no literal representation
    // unlike 'null'. We gave it its own rule so it's easy to
    // highlight in text editors and other applications.
    _identifier: ($) => choice($.undefined, $.identifier),

    identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    private_property_identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq("#", alpha, repeat(alphanumeric)));
    },

    meta_property: (_) =>
      choice(seq("new", ".", "target"), seq("import", ".", "meta")),

    this: (_) => "this",
    super: (_) => "super",
    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",
    undefined: (_) => "undefined",

    //
    // Expression components
    //

    arguments: ($) =>
      seq("(", commaSep(optional(choice($.expression, $.spread_element))), ")"),

    decorator: ($) =>
      seq(
        "@",
        choice(
          $.identifier,
          alias($.decorator_member_expression, $.member_expression),
          alias($.decorator_call_expression, $.call_expression),
        ),
      ),

    decorator_member_expression: ($) =>
      prec(
        "member",
        seq(
          field(
            "object",
            choice(
              $.identifier,
              alias($.decorator_member_expression, $.member_expression),
            ),
          ),
          ".",
          field("property", alias($.identifier, $.property_identifier)),
        ),
      ),

    decorator_call_expression: ($) =>
      prec(
        "call",
        seq(
          field(
            "function",
            choice(
              $.identifier,
              alias($.decorator_member_expression, $.member_expression),
            ),
          ),
          field("arguments", $.arguments),
        ),
      ),

    class_body: ($) =>
      seq(
        "{",
        repeat(
          choice(
            seq(field("member", $.method_definition), optional(";")),
            seq(field("member", $.field_definition), $._semicolon),
            field("member", $.class_static_block),
            ";",
          ),
        ),
        "}",
      ),

    field_definition: ($) =>
      seq(
        repeat(field("decorator", $.decorator)),
        optional("static"),
        field("property", $._property_name),
        optional($._initializer),
      ),

    formal_parameters: ($) =>
      seq(
        "(",
        optional(seq(commaSep1($._formal_parameter), optional(","))),
        ")",
      ),

    class_static_block: ($) =>
      seq(
        "static",
        optional($._automatic_semicolon),
        field("body", $.statement_block),
      ),

    // This negative dynamic precedence ensures that during error recovery,
    // unfinished constructs are generally treated as literal expressions,
    // not patterns.
    pattern: ($) => prec.dynamic(-1, choice($._lhs_expression, $.rest_pattern)),

    rest_pattern: ($) => prec.right(seq("...", $._lhs_expression)),

    method_definition: ($) =>
      seq(
        repeat(field("decorator", $.decorator)),
        optional(
          choice(
            "static",
            alias(token(seq("static", /\s+/, "get", /\s*\n/)), "static get"),
          ),
        ),
        optional("async"),
        optional(choice("get", "set", "*")),
        field("name", $._property_name),
        field("parameters", $.formal_parameters),
        field("body", $.statement_block),
      ),

    pair: ($) =>
      seq(field("key", $._property_name), ":", field("value", $.expression)),

    pair_pattern: ($) =>
      seq(
        field("key", $._property_name),
        ":",
        field("value", choice($.pattern, $.assignment_pattern)),
      ),

    _property_name: ($) =>
      choice(
        alias(
          choice($.identifier, $._reserved_identifier),
          $.property_identifier,
        ),
        $.private_property_identifier,
        $.string,
        $.number,
        $.computed_property_name,
      ),

    computed_property_name: ($) => seq("[", $.expression, "]"),

    _reserved_identifier: (_) =>
      choice("get", "set", "async", "static", "export", "let"),

    _semicolon: ($) => choice($._automatic_semicolon, ";"),

    // markdown
  },
});

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

// Returns a rule that matches all characters that count as punctuation inside markdown, besides
// a list of excluded punctuation characters. Calling this function with a empty list as the second
// argument returns a rule that matches all punctuation.
function punctuation_without($, chars) {
  return seq(
    choice(...PUNCTUATION_CHARACTERS_ARRAY.filter((c) => !chars.includes(c))),
    optional($._last_token_punctuation),
  );
}
//
// Constructs a regex that matches all html entity references.
function html_entity_regex() {
  // A file with all html entities, should be kept up to date with
  // https://html.spec.whatwg.org/multipage/entities.json
  let html_entities = require("./html_entities.json");
  let s = "&(";
  s += Object.keys(html_entities)
    .map((name) => name.substring(1, name.length - 1))
    .join("|");
  s += ");";
  return new RegExp(s);
}
