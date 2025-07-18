; injections.scm
; --------------

((text) @injection.content
  (#set! injection.language "markdown"))

((jsx_element) @injection.content
  (#set! injection.language "javascript"))

((jsx_self_closing_element) @injection.content
  (#set! injection.language "javascript"))

((jsx_expression) @injection.content
  (#set! injection.language "javscript"))

((import_statement) @injection.content
  (#set! injection.language "javscript"))

((export_statement) @injection.content
  (#set! injection.language "javscript"))
