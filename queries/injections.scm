; injections.scm
; --------------

((markdown) @injection.content
  (#set! injection.language "markdown"))

((jsx_component) @injection.content
  (#set! injection.language "javascript"))

(
  (expression
    (markdown) @injection.content
  )
  (#set! injection.language "javscript")
)
