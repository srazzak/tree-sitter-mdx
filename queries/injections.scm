; injections.scm
; --------------

((text) @injection.content
  (#set! injection.language "markdown"))

((jsx_element) @injection.content
  (#set! injection.language "javascript"))

((jsx_expression @injection.content
  (#set! injection.language "javscript"))
