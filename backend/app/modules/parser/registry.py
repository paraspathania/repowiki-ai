from typing import Dict, Optional
from app.modules.parser.abstraction import ParserAdapter
from app.modules.parser.plugins.python import PythonParserPlugin
from app.modules.parser.plugins.typescript import TypeScriptParserPlugin

_PARSER_REGISTRY: Dict[str, ParserAdapter] = {
    ".py": PythonParserPlugin(),
    ".ts": TypeScriptParserPlugin(),
    ".tsx": TypeScriptParserPlugin(),
    ".js": TypeScriptParserPlugin(),
    ".jsx": TypeScriptParserPlugin(),
}


def get_parser_for_extension(ext: str) -> Optional[ParserAdapter]:
    if not ext:
        return None
    normalized_ext = ext.lower()
    if not normalized_ext.startswith("."):
        normalized_ext = f".{normalized_ext}"
    return _PARSER_REGISTRY.get(normalized_ext)
