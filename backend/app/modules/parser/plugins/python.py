import ast
import re
from typing import List
from app.modules.parser.abstraction import ParserAdapter, ParserResult, ExtractedSymbol, ExtractedImport, ExtractedAPI
from app.modules.symbols.models import SymbolType


class PythonParserPlugin(ParserAdapter):
    def parse(self, code_content: str, file_path: str) -> ParserResult:
        result = ParserResult()
        
        try:
            tree = ast.parse(code_content)
        except SyntaxError:
            # Fallback to regex parser if AST fails
            return self._regex_fallback_parse(code_content)

        lines = code_content.splitlines()

        for node in ast.walk(tree):
            # 1. Functions & Methods
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                start_line = getattr(node, "lineno", 1)
                end_line = getattr(node, "end_lineno", start_line)
                
                # Check for FastAPI decorators (@app.get, @router.post, etc.)
                for decorator in node.decorator_list:
                    dec_str = ast.unparse(decorator) if hasattr(ast, "unparse") else ""
                    api_match = re.search(r"(?:app|router)\.(get|post|put|delete|patch|options)\s*\(\s*[\"']([^\"']+)[\"']", dec_str)
                    if api_match:
                        method = api_match.group(1).upper()
                        route = api_match.group(2)
                        result.apis.append(
                            ExtractedAPI(
                                method=method,
                                route=route,
                                handler=node.name,
                                start_line=start_line,
                                end_line=end_line,
                                authentication="Depends" in dec_str or "get_current_user" in dec_str,
                            )
                        )

                sig_line = lines[start_line - 1] if start_line <= len(lines) else f"def {node.name}(...)"
                result.symbols.append(
                    ExtractedSymbol(
                        name=node.name,
                        qualified_name=f"{file_path}:{node.name}",
                        symbol_type=SymbolType.FUNCTION,
                        start_line=start_line,
                        end_line=end_line,
                        signature=sig_line.strip(),
                    )
                )

            # 2. Classes
            elif isinstance(node, ast.ClassDef):
                start_line = getattr(node, "lineno", 1)
                end_line = getattr(node, "end_lineno", start_line)
                sig_line = lines[start_line - 1] if start_line <= len(lines) else f"class {node.name}:"
                result.symbols.append(
                    ExtractedSymbol(
                        name=node.name,
                        qualified_name=f"{file_path}:{node.name}",
                        symbol_type=SymbolType.CLASS,
                        start_line=start_line,
                        end_line=end_line,
                        signature=sig_line.strip(),
                    )
                )

            # 3. Imports
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    result.imports.append(
                        ExtractedImport(
                            module=alias.name,
                            imported_names=[alias.asname or alias.name],
                            line_number=getattr(node, "lineno", 1),
                        )
                    )
            elif isinstance(node, ast.ImportFrom):
                module_name = node.module or ""
                names = [alias.name for alias in node.names]
                result.imports.append(
                    ExtractedImport(
                        module=module_name,
                        imported_names=names,
                        line_number=getattr(node, "lineno", 1),
                    )
                )

        return result

    def _regex_fallback_parse(self, code_content: str) -> ParserResult:
        result = ParserResult()
        lines = code_content.splitlines()
        for idx, line in enumerate(lines, 1):
            func_match = re.match(r"^\s*(async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(", line)
            if func_match:
                name = func_match.group(2)
                result.symbols.append(
                    ExtractedSymbol(
                        name=name,
                        qualified_name=f"func:{name}",
                        symbol_type=SymbolType.FUNCTION,
                        start_line=idx,
                        end_line=idx + 10,
                        signature=line.strip(),
                    )
                )
            class_match = re.match(r"^\s*class\s+([a-zA-Z0-9_]+)", line)
            if class_match:
                name = class_match.group(1)
                result.symbols.append(
                    ExtractedSymbol(
                        name=name,
                        qualified_name=f"class:{name}",
                        symbol_type=SymbolType.CLASS,
                        start_line=idx,
                        end_line=idx + 20,
                        signature=line.strip(),
                    )
                )
        return result
