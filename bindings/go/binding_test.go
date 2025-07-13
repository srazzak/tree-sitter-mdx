package tree_sitter_mdx_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_mdx "www.github.com/srazzak/tree-sitter-mdx/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_mdx.Language())
	if language == nil {
		t.Errorf("Error loading MDX grammar")
	}
}
