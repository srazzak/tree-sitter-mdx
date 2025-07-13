import XCTest
import SwiftTreeSitter
import TreeSitterMdx

final class TreeSitterMdxTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_mdx())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading MDX grammar")
    }
}
